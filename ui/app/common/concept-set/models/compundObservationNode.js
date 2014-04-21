'use strict';

Bahmni.ConceptSet.CompundObservationNode = function(compoundObservation, primaryMRSConcept, compoundObservationConcept, conceptConfig) {
    var conceptName = primaryMRSConcept.name.name;
    this.primaryConcept = new Bahmni.ConceptSet.ConceptMapper().map(primaryMRSConcept);
    this.compoundObservation = compoundObservation;
    this.conceptConfig = conceptConfig || {};
    this.showAbnormalIndicator =  this.conceptConfig.showAbnormalIndicator;
    this.isRequired = this.conceptConfig.required;
    this.label = conceptName;
    this.units = primaryMRSConcept.units;
    this.dataTypeName = primaryMRSConcept.datatype.name;
    this.hiNormal = primaryMRSConcept.hiNormal;
    this.lowNormal = primaryMRSConcept.lowNormal;
    this.possibleAnswers = primaryMRSConcept.answers;
    this.children = [];

    var compoundObservationWrapperClass = this.conceptConfig.multiselect ? Bahmni.ConceptSet.MultiValueCompundObservation : Bahmni.ConceptSet.SingleValueCompundObservation;
    this.compoundObservationWrapper = new compoundObservationWrapperClass(compoundObservation, this.primaryConcept, compoundObservationConcept);
    this.primaryObservation = this.compoundObservationWrapper.primaryObservation;
    this.abnormalityObservation = this.compoundObservationWrapper.abnormalityObservation;

    var _value = this.compoundObservationWrapper.getValue();
    Object.defineProperty(this, 'value', {
        get: function() { return _value; },
        set: function(newValue) {
            _value = newValue;
            this.compoundObservationWrapper.setValue(newValue);                    
            if(!this.hasValue()) {
                this.abnormalityObservation.value = undefined;
            }
            this.onValueChanged();
        }
    });
};

Bahmni.ConceptSet.CompundObservationNode.prototype = {
    getPossibleAnswers: function(){
        return this.possibleAnswers;
    },

    getConceptConfig: function() {
        return this.conceptConfig;
    },

    addChild: function(child) {
        return this.children.push(child);
    },

    isGroup: function () {
        return this.children.length > 0;
    },

    getControlType: function () {
        if (this.getConceptConfig().freeTextAutocomplete) return "freeTextAutocomplete";
        if (this._isHtml5InputDataType()) return "html5InputDataType";
        if (this._isText()) return "text";
        if (this._isCoded()) return this._getCodedControlType();
        return "unknown";
    },

    _getCodedControlType: function() {
        var conceptConfig = this.getConceptConfig();
        if(conceptConfig.multiselect) return "multiselect";
        if(conceptConfig.autocomplete) return "autocomplete";
        return "dropdown";
    },

    _isNumeric: function () {
        return this.dataTypeName === "Numeric";
    },

    _isText: function () {
        return this.dataTypeName === "Text";
    },

    _isCoded: function () {
        return this.dataTypeName === "Coded";
    },

    _isHtml5InputDataType: function () {
        return ['Date', 'Numeric'].indexOf(this.dataTypeName) != -1;
    },

    _isDateDataType: function () {
        return 'Date'.indexOf(this.dataTypeName) != -1;
    },

    validateNumericValue: function(){
        if(this.value) {
            var valueInRange = this.value < (this.hiNormal|| Infinity) && this.value > (this.lowNormal|| 0);
            this.abnormalityObservation.value = !valueInRange;
        } else {
            this.abnormalityObservation.value = undefined;
        }
    },

    onValueChanged: function () {
        if(this._isNumeric()){
            this.validateNumericValue();
        }
    },

    hasValue: function() {
        if(this.value === '' || this.value === null || this.value === undefined) return false;
        if(this.value instanceof Array) return this.value.length > 0;
        return true;
    },

    atLeastOneValueSet: function() {
        if(this.isGroup()) {
            return this.children.some(function(childNode){ return childNode.atLeastOneValueSet(); })
        } else {
            return this.hasValue();
        }
    },

    isValid: function(checkRequiredFields) {
        if(this.isGroup()) return this._hasValidChildren(checkRequiredFields);
        if(checkRequiredFields && this.isRequired && !this.hasValue()) return false;
        if(this._isDateDataType()) return this._isValidDate();
        return true;
    },

    _hasValidChildren: function(checkRequiredFields) {
        return this.children.every(function(childNode){ return childNode.isValid(checkRequiredFields) });
    },

    _isValidDate: function () {
        if (!this.hasValue()) return true;
        var date = new Date(this.value);
        return date.getUTCFullYear() && date.getUTCFullYear().toString().length <= 4;
    }
};