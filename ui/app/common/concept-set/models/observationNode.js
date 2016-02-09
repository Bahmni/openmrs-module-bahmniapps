Bahmni.ConceptSet.ObservationNode = function (observation, savedObs, conceptUIConfig) {
    angular.extend(this, observation);

    this.cloneNew = function() {
        var oldObs = angular.copy(observation);
        oldObs.groupMembers = _.map(oldObs.groupMembers, function(member) {
            return member.cloneNew();
        });

        var clone = new Bahmni.ConceptSet.ObservationNode(oldObs, null, conceptUIConfig);
        clone.comment = undefined;
        return clone;
    };

    Object.defineProperty(this, 'value', {
        enumerable: true,
        get: function () {
            if (this.primaryObs) {
                return typeof this.getPrimaryObs().value==="object"  && this.getPrimaryObs().value!==null?
                    this.getPrimaryObs().value.name:this.getPrimaryObs().value;
            }
            return undefined;
        },
        set: function (newValue) {
            if(typeof newValue === "object"){
                this.getCodedObs().value = newValue;
                this.getCodedObs().voided = false;

                if(this.getFreeTextObs()){
                    if(this.getFreeTextObs().uuid){
                        this.getFreeTextObs().voided = true;
                    }else{
                        this.getFreeTextObs().value = undefined;
                    }
                }
            }
            else {
                var freeTextObs = this.getFreeTextObs();
                if(freeTextObs){
                    freeTextObs.value = newValue;
                    freeTextObs.voided = false;
                }
                if(this.getCodedObs()){
                    if(this.getCodedObs().uuid){
                        this.getCodedObs().voided = true;
                    }else{
                        this.getCodedObs().value = undefined;
                    }
                }
            }
            this.onValueChanged(newValue);
        }
    });

    Object.defineProperty(this, 'primaryObs', {
        enumerable: true,
        get: function () {
            return this.getPrimaryObs();
        }
    });

    this.conceptUIConfig= conceptUIConfig[this.primaryObs.concept.name] || [];

    Object.defineProperty(this, 'markedAsNonCoded', {
        enumerable: true,
        get: function () {
            if(this.getPrimaryObs().nonCodedAnswer===undefined){
                this.getPrimaryObs().nonCodedAnswer = Boolean(this.getPrimaryObs().concept.dataType!=="Coded" && this.getPrimaryObs().uuid);
            }
            return this.getPrimaryObs().nonCodedAnswer;
        },
        set : function(isNonCoded){
            this.getPrimaryObs().nonCodedAnswer = isNonCoded;
        }
    });

    this.isObservationNode = true;
    this.uniqueId = _.uniqueId('observation_');
    this.durationObs = this.getDurationObs();
    this.abnormalObs = this.getAbnormalObs();
    this.unknownObs = this.getUnknownObs();


    if (savedObs) {
        this.uuid = savedObs.uuid;
        this.observationDateTime = savedObs.observationDateTime;
    } else {
        this.value = this.conceptUIConfig.defaultValue;
    }
};

Bahmni.ConceptSet.ObservationNode.prototype = {
    canAddMore: function() {
        return this.conceptUIConfig.allowAddMore == true;
    },

    isStepperControl: function() {
        if(this.isNumeric()){
            return this.conceptUIConfig.stepper == true;
        }
        return false;
    },

    getPossibleAnswers: function () {
        return this.primaryObs.concept.answers;
    },

    _getGroupMemberWithClass: function(className) {
        return this._getGroupMembersWithClass(className)[0];
    },

    _getGroupMembersWithClass: function(className) {
         var groupMembers = this.groupMembers.filter(function (member) {
            return (member.concept.conceptClass.name === className) || (member.concept.conceptClass === className);
        });

        return groupMembers;
    },

    _getGroupMembersWithoutClass: function(classNames) {
         var groupMembers = this.groupMembers.filter(function (member) {
            return !(_.include(classNames, member.concept.conceptClass.name) || _.include(classNames, member.concept.conceptClass));
        });

        return groupMembers;
    },

    getAbnormalObs: function () {
        return this._getGroupMemberWithClass(Bahmni.Common.Constants.abnormalConceptClassName);
    },

    getUnknownObs: function () {
        return this._getGroupMemberWithClass(Bahmni.Common.Constants.unknownConceptClassName);
    },

    getDurationObs: function () {
        var groupMemberWithClass = this._getGroupMemberWithClass(Bahmni.Common.Constants.durationConceptClassName);
        return  groupMemberWithClass;
    },

    getPrimaryObs: function () {
        var observations = this._getGroupMembersWithoutClass([ Bahmni.Common.Constants.abnormalConceptClassName,
                                                               Bahmni.Common.Constants.unknownConceptClassName,
                                                               Bahmni.Common.Constants.durationConceptClassName]);
        //todo : add migration to set correct sort orders for the concepts
        //this is needed when you have freetext autocomplete
        var primaryObs = observations[1] && observations[1].uuid && !observations[1].voided? observations[1]:observations[0];
        if (observations[0].isMultiSelect) {
            return observations[0];
        }
        if(primaryObs.uuid && !primaryObs.voided) return primaryObs;

        return observations[1] && (observations[1].value || observations[1].value === "") && !observations[1].voided? observations[1]:observations[0];
    },

    onValueChanged: function () {
        if (!this.primaryObs.hasValue() && this.getAbnormalObs()) {
            this.getAbnormalObs().value = undefined;
        }
        if (this.primaryObs.isNumeric() && this.primaryObs.hasValue() && this.getAbnormalObs()) {
            this.setAbnormal();
        }
//        TODO: Mihir, D3 : Hacky fix to update the datetime to current datetime on the server side. Ideal would be void the previous observation and create a new one.
        this.primaryObs.observationDateTime = null;
        if(this.getUnknownObs()) {
            this.setUnknown();
        }
    },

    setAbnormal: function () {
        if (this.primaryObs.hasValue()) {
            var erroneousValue = this.value > (this.primaryObs.concept.hiAbsolute || Infinity) || this.value < (this.primaryObs.concept.lowAbsolute || 0);
            var valueInRange = this.value <= (this.primaryObs.concept.hiNormal || Infinity) && this.value >= (this.primaryObs.concept.lowNormal || 0);
            this.abnormalObs.value = !valueInRange;
            this.abnormalObs.erroneousValue = erroneousValue;
        } else {
            this.abnormalObs.value = undefined;
            this.abnormalObs.erroneousValue = undefined;
        }
    },

    setUnknown: function () {
        if (this.primaryObs.atLeastOneValueSet() && this.primaryObs.hasValue()) {
            this.unknownObs.value = false;
        } else {
            if(this.unknownObs.value == false){
                this.unknownObs.value = undefined;
            }
        }
    },

    displayValue: function () {
        if (this.possibleAnswers.length > 0) {
            for (var i = 0; i < this.possibleAnswers.length; i++) {
                if (this.possibleAnswers[i].uuid === this.value) {
                    return this.possibleAnswers[i].display;
                }
            }
        }
        else {
            return this.value;
        }
    },

    isGroup: function () {
        return false;
    },

    getControlType: function () {
        if (this.conceptUIConfig.freeTextAutocomplete) return "freeTextAutocomplete";
        if (this.conceptUIConfig.autocomplete) return "autocomplete";
        if (this.isHtml5InputDataType()) return "html5InputDataType";
        if (this.getPrimaryObs().isCoded() && this.primaryObs.isMultiSelect) return "buttonselect";
        if (this.primaryObs.isText()) return "text";
        if (this.primaryObs.isCoded()) return this._getCodedControlType();
        if (this.primaryObs.isBoolean) return "buttonselect";
        return "unknown";
    },

    _getCodedControlType: function () {
        var conceptUIConfig = this.conceptUIConfig;
        if (conceptUIConfig.multiselect) return "multiselect";
        if (conceptUIConfig.buttonSelect) return "buttonselect";
        if (conceptUIConfig.autocomplete) return "autocomplete";
        return "dropdown";
    },

    isHtml5InputDataType: function () {
        return ['Date', 'Numeric', 'Datetime'].indexOf(this.primaryObs.getDataTypeName()) != -1;
    },

    _isDateDataType: function () {
        return "Date" === this.primaryObs.getDataTypeName();
    },

    _isDateTimeDataType: function () {
        return "Datetime" === this.primaryObs.getDataTypeName();
    },

    getHighAbsolute: function () {
        return this.concept.hiAbsolute;
    },

    getLowAbsolute: function () {
        return this.concept.lowAbsolute;
    },

    getInputType: function () {
        return this.getDataTypeName();
    },

    isComputed: function() {
        return this.primaryObs.isComputed();
    },

    isComputedAndEditable: function() {
        return this.concept.conceptClass === "Computed/Editable";
    },

    atLeastOneValueSet: function () {
        return this.primaryObs.hasValue();
    },

    hasDuration: function () {
        if (!this.getDurationObs() || !this.conceptUIConfig.durationRequired){
            return false;
        }
        else {
            if (!this.getDurationObs().value) {
                return true;
            }
            else if (this.getDurationObs().value < 0){
                return true;
            }
            else{
                return false;
            }
        }

    },

    isValid: function (checkRequiredFields, conceptSetRequired) {

        if (this.isGroup()) return this._hasValidChildren(checkRequiredFields, conceptSetRequired);
        if(checkRequiredFields){
            if (conceptSetRequired && this.isRequired() && !this.getPrimaryObs().hasValue()) return false;
            if (this.isRequired() && !this.getPrimaryObs().hasValue()) return false;
            if (this.getControlType() === "freeTextAutocomplete" ) { return this.isValidFreeTextAutocomplete()}
        }
        if (this._isDateDataType()) return this.getPrimaryObs().isValidDate();
        if (this.getPrimaryObs().hasValue() && this.hasDuration()) return false;
        if (this.abnormalObs && this.abnormalObs.erroneousValue) return false;
        if (this.getPrimaryObs().hasValue() && this.getPrimaryObs()._isDateTimeDataType()) return !this.hasInvalidDateTime();
        return true;
    },

    isValueInAbsoluteRange: function () {
        if(this.abnormalObs!=null && this.abnormalObs.erroneousValue) return false;
        return true;
    },

    isValidFreeTextAutocomplete : function(){
        if (this.getPrimaryObs().concept.dataType!=="Coded" && !this.markedAsNonCoded && this.getPrimaryObs().value) {
           return false;
        }
        return true;
    },

    isRequired: function () {
        return this.conceptUIConfig.required || false;
    },

    isDurationRequired: function () {
        return this.conceptUIConfig.durationRequired || false;
    },

    isNumeric: function () {
        return this.primaryObs.getDataTypeName() === "Numeric";
    },

    _hasValidChildren: function (checkRequiredFields, conceptSetRequired) {
        return this.groupMembers.every(function (member) {
            return member.isValid(checkRequiredFields, conceptSetRequired)
        });
    },

    getFreeTextObs : function(){
        if(!this.freeTextPrimaryObs){
            this.freeTextPrimaryObs = this.groupMembers.filter(function (member) {
                return (((member.concept.conceptClass.name === Bahmni.Common.Constants.miscConceptClassName)
                    || (member.concept.conceptClass === Bahmni.Common.Constants.miscConceptClassName))
                    && (member.concept.dataType!=="Coded"));
            })[0];
        }
        return this.freeTextPrimaryObs;
    },

    getCodedObs: function(){
        if(!this.codedPrimaryObs){
            this.codedPrimaryObs= this.groupMembers.filter(function (member) {
                return (((member.concept.conceptClass.name === Bahmni.Common.Constants.miscConceptClassName)
                    || (member.concept.conceptClass === Bahmni.Common.Constants.miscConceptClassName))
                    && (member.concept.dataType==="Coded"));
            })[0];
        }
        return this.codedPrimaryObs;
    },

    markAsNonCoded: function() {
        this.markedAsNonCoded = !this.markedAsNonCoded;
    },

    toggleAbnormal: function() {
        this.abnormalObs.value = !this.abnormalObs.value;
    },

    toggleUnknown: function() {
        if(!this.unknownObs.value) {
            this.unknownObs.value = true;
        }else{
            this.unknownObs.value = undefined;
        }
    },

    assignAddMoreButtonID : function(){
        return this.concept.name.split(' ').join('_').toLowerCase() + '_addmore_' + this.uniqueId;
    },

    canHaveComment : function() {
        return this.conceptUIConfig.disableAddNotes ?  !this.conceptUIConfig.disableAddNotes : true;
    },

    hasInvalidDateTime: function () {
        if (this.isComputed()) return false;
        var date = Bahmni.Common.Util.DateUtil.parse(this.value);
        if (!this.conceptUIConfig.allowFutureDates) {
            if (moment() < date) return true;
        }
        return this.value === "Invalid Datetime";
    }


};