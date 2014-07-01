Bahmni.ConceptSet.ObservationNode = function (observation, savedObs, conceptUIConfig) {
    angular.extend(this, observation);
    Object.defineProperty(this, 'value', {
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
                this.getFreeTextObs().value = newValue;
                this.getFreeTextObs().voided = false;
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
        get: function () {
            return this.getPrimaryObs();
        }
    });

    Object.defineProperty(this, 'markedAsNonCoded', {
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

    this.conceptUIConfig = conceptUIConfig;
    this.isObservationNode = true;
    this.uniqueId = _.uniqueId('observation_');
    this.observationDateTime = Bahmni.Common.Util.DateUtil.now();
    if (savedObs) {
        this.uuid = savedObs.uuid;
        this.observationDateTime = savedObs.observationDateTime;
    }
    this.duration = this.getDuration();
    this.abnormal = this.getAbnormal();
};

Bahmni.ConceptSet.ObservationNode.prototype = {

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

    getAbnormal: function () {
        return this._getGroupMemberWithClass(Bahmni.Common.Constants.abnormalConceptClassName);
    },

    getDuration: function () {
        var groupMemberWithClass = this._getGroupMemberWithClass(Bahmni.Common.Constants.durationConceptClassName);
        return  groupMemberWithClass;
    },

    getPrimaryObs: function () {
        var observations = this._getGroupMembersWithClass(Bahmni.Common.Constants.miscConceptClassName);
        //todo : add migration to set correct sort orders for the concepts
        //this is needed when you have freetext autocomplete
        var primaryObs = observations[1] && observations[1].uuid && !observations[1].voided? observations[1]:observations[0];
        if(primaryObs.uuid && !primaryObs.voided) return primaryObs;

        return observations[1] && (observations[1].value || observations[1].value === "") && !observations[1].voided? observations[1]:observations[0];
    },

    onValueChanged: function () {
        if (!this.primaryObs.hasValue() && this.getAbnormal()) {
            this.getAbnormal().value = undefined;
        }
        if (this.primaryObs.isNumeric()) {
            this.setAbnormal();
        }
    },

    setAbnormal: function () {
        if (this.primaryObs.hasValue()) {
            var valueInRange = this.value <= (this.primaryObs.concept.hiNormal || Infinity) && this.value >= (this.primaryObs.concept.lowNormal || 0);
            this.abnormal.value = !valueInRange;
        } else {
            this.abnormal.value = undefined;
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

    getConceptUIConfig: function () {
        return this.conceptUIConfig[this.primaryObs.concept.name] || [];
    },

    getControlType: function () {
        if (this.getConceptUIConfig().freeTextAutocomplete) return "freeTextAutocomplete";
        if (this.isHtml5InputDataType()) return "html5InputDataType";
        if (this.primaryObs.isText()) return "text";
        if (this.primaryObs.isCoded()) return this._getCodedControlType();
        return "unknown";
    },

    _getCodedControlType: function () {
        var conceptUIConfig = this.getConceptUIConfig();
        if (conceptUIConfig.multiselect) return "multiselect";
        if (conceptUIConfig.autocomplete) return "autocomplete";
        return "dropdown";
    },

    isHtml5InputDataType: function () {
        return ['Date', 'Numeric'].indexOf(this.primaryObs.getDataTypeName()) != -1;
    },

    _isDateDataType: function () {
        return 'Date'.indexOf(this.primaryObs.getDataTypeName()) != -1;
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

    atLeastOneValueSet: function () {
        if (this.isGroup()) {
            return this.children.some(function (childNode) {
                return childNode.atLeastOneValueSet();
            })
        } else {
            return this.primaryObs.hasValue();
        }
    },

    hasDuration: function () {
        if (!this.getDuration() || !this.getConceptUIConfig().durationRequired){
            return false;
        }
        else {
            if (!this.getDuration().value) {
                return true;
            }
            else if (this.getDuration().value < 0){
                return true;
            }
            else{
                return false;
            }
        }

    },

    isValid: function (checkRequiredFields, conceptSetRequired) {
        if (this.isGroup()) return this._hasValidChildren(checkRequiredFields, conceptSetRequired);
        if (conceptSetRequired && this.isRequired() && !this.getPrimaryObs().hasValue()) return false;
        if (checkRequiredFields && this.isRequired() && !this.getPrimaryObs().hasValue()) return false;
        if (this._isDateDataType()) return this.getPrimaryObs().isValidDate();
        if (this.getControlType() === "freeTextAutocomplete" ) { return this.isValidFreeTextAutocomplete()}
        if (this.getPrimaryObs().hasValue() && this.hasDuration()) return false;
        return true;
    },

    isValidFreeTextAutocomplete : function(){
        if (this.getPrimaryObs().concept.dataType!=="Coded" && !this.markedAsNonCoded && this.getPrimaryObs().value) {
           return false;
        }
        return true;
    },

    isRequired: function () {
        return this.getConceptUIConfig().required || false;
    },

    isDurationRequired: function () {
        return this.getConceptUIConfig().durationRequired || false;
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
    }

};