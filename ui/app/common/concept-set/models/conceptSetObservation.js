Bahmni.ConceptSet.Observation = function (observation, savedObs, conceptUIConfig) {
    angular.extend(this, observation);
    this.isObservation = true;
    this.conceptUIConfig = conceptUIConfig;
    this.uniqueId = _.uniqueId('observation_');

    if (savedObs) {
        this.uuid = savedObs.uuid;
        this.value = savedObs.value;
        this.observationDateTime = savedObs.observationDateTime;
        this.provider = savedObs.provider;
    } else {
        this.value = this.getConceptUIConfig().defaultValue;         
    }
};

Bahmni.ConceptSet.Observation.prototype = {
    
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
        if (this.groupMembers)
            return this.groupMembers.length > 0;
        return false;
    },

    isComputed: function() {
        return this.concept.conceptClass === "Computed";
    },

    isNumeric: function () {
        return this.getDataTypeName() === "Numeric";
    },

    isText: function () {
        return this.getDataTypeName() === "Text";
    },

    isCoded: function () {
        return this.getDataTypeName() === "Coded";
    },

    isImage: function () {
        return this.concept.conceptClass == Bahmni.Common.Constants.imageClassName;
    },

    getDataTypeName: function () {
        return this.concept.dataType;
    },
    
    isDateDataType: function () {
        return 'Date'.indexOf(this.getDataTypeName()) != -1;
    },

    getPossibleAnswers: function() {
        return this.possibleAnswers;
    },

    getHighAbsolute: function () {
        return this.concept.hiAbsolute;
    },

    getLowAbsolute: function () {
        return this.concept.lowAbsolute;
    },

    getConceptUIConfig: function () {
        return this.conceptUIConfig[this.concept.name] || [];
    },

    isHtml5InputDataType: function () {
        return ['Date', 'Numeric'].indexOf(this.getDataTypeName()) != -1;
    },

    isGrid: function () {
        return this.getConceptUIConfig().grid;
    },

    isButtonRadio: function () {
        return this.getConceptUIConfig().buttonRadio;
    },

    getControlType: function () {
        if (this.hidden) return "hidden";
        if (this.getConceptUIConfig().freeTextAutocomplete) return "freeTextAutocomplete";
        if (this.isHtml5InputDataType()) return "html5InputDataType";
        if (this.isImage()) return "image";
        if (this.isText()) return "text";
        if (this.isCoded()) return this._getCodedControlType();
        if (this.isGrid()) return "grid";
        return "unknown";
    },

    canHaveComment: function() {
        return !this.isText() && !this.isImage();
    },

    isConciseText: function(){
        return this.getConceptUIConfig().conciseText == true;
    },

    _getCodedControlType: function () {
        var conceptUIConfig = this.getConceptUIConfig();
        if (conceptUIConfig.autocomplete) return "autocomplete";
        return "buttonselect";

    },

    onValueChanged: function () {
//        TODO: Mihir, D3 : Hacky fix to update the datetime to current datetime on the server side. Ideal would be void the previous observation and create a new one.
        this.observationDateTime = null;
    },

    getInputType: function () {
        return this.getDataTypeName();
    },

    atLeastOneValueSet: function () {
        if (this.isGroup()) {
            return this.groupMembers.some(function (childNode) {
                return childNode.atLeastOneValueSet();
            })
        } else {
            return this.hasValue();
        }
    },

    hasValue: function () {
        var value = this.value;
        if (value === '' || value === null || value === undefined) return false;
        if (value instanceof Array) return value.length > 0;
        return true;
    },

    hasValueOf: function(value) {
        if(!this.value || !value) return false;
        return this.value == value || this.value.uuid == value.uuid;
    },

    toggleSelection: function(answer) {
        if (this.value && this.value.uuid === answer.uuid) {
            this.value = null;
        } else {
            this.value = answer;
        }
    },

    isValidDate: function () {
        if (!this.hasValue()) return true;
        var date = Bahmni.Common.Util.DateUtil.parse(this.value);
        return date.getUTCFullYear() && date.getUTCFullYear().toString().length <= 4;
    },

    isValid: function (checkRequiredFields, conceptSetRequired) {
        if (this.isGroup()) return this._hasValidChildren(checkRequiredFields, conceptSetRequired);
        if (conceptSetRequired && this.isRequired() && !this.hasValue()) return false;
        if (checkRequiredFields && this.isRequired() && !this.hasValue()) return false;
        if (this._isDateDataType()) return this.isValidDate();
        return true;
    },

    _isDateDataType: function () {
        return 'Date'.indexOf(this.getDataTypeName()) != -1;
    },

    isRequired: function () {
        return this.getConceptUIConfig().required;
    },

    isFormElement: function() {
        return (!this.concept.set || this.isGrid()) && !this.isComputed();
    },

    _hasValidChildren: function (checkRequiredFields, conceptSetRequired) {
        return this.groupMembers.every(function (member) {
            return member.isValid(checkRequiredFields, conceptSetRequired)
        });
    },

    markAsNonCoded: function() {
      this.markedAsNonCoded = !this.markedAsNonCoded;
    },

    toggleVoidingOfImage: function() {
        this.voided = !this.voided;
    }

};