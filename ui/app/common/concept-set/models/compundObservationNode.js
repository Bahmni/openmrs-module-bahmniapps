'use strict';

(function(){
    var findPrimaryObservation = function(observations, xCompoundObservationConcept) {
        var compundObservationMemberUuids = xCompoundObservationConcept.setMembers.map(function(member) { return member.uuid; });
        return observations.filter(function(observation) {
            return compundObservationMemberUuids.indexOf(observation.concept.uuid) === -1; 
        })[0];
    };

    var findAbnormalityObservation = function(observations) {
        return observations.filter(function(observation) { return observation.concept.name === Bahmni.Common.Constants.abnormalObservationConceptName; })[0];
    };

    var newAbnormalityObservation = function(xCompoundObservationConcept) {
        return createObservation(findConcept(xCompoundObservationConcept.setMembers, Bahmni.Common.Constants.abnormalObservationConceptName));
    };

    var createObservation = function(baseConcept, groupMembers) {
        return { concept: { name: baseConcept.name.name, uuid: baseConcept.uuid },
                 groupMembers: groupMembers || []
                };
    };

    var findConcept = function(concepts, name) {
        return concepts.filter(function(member) {
            return member.name.name === name;
        })[0];
    };

    Bahmni.ConceptSet.CompundObservationNode = function(compoundObservation, primaryObservation, primaryConcept, abnormalityObservation, conceptUIConfig){
        var conceptName = primaryConcept.name.name;
        var conceptConfig = conceptUIConfig[conceptName] || {};
        this.primaryObservation = primaryObservation;
        this.abnormalityObservation = abnormalityObservation;
        this.compoundObservation = compoundObservation;
        this.compoundObservation.groupMembers = [primaryObservation, abnormalityObservation];
        this.showAbnormalIndicator =  conceptConfig.showAbnormalIndicator;
        this.isRequired = conceptConfig.required;
        this.conceptConfig = conceptConfig;
        this.label = conceptName;
        this.units = primaryConcept.units;
        this.dataTypeName = primaryConcept.datatype.name;
        this.hiAbsolute = primaryConcept.hiAbsolute;
        this.lowAbsolute = primaryConcept.lowAbsolute;
        this.possibleAnswers = primaryConcept.answers;
        this.children = [];
    };

    Bahmni.ConceptSet.CompundObservationNode.create = function(compoundObservation, primaryConcept, xCompoundObservationConcept, conceptUIConfig) {
        var primaryObservation = findPrimaryObservation(compoundObservation.groupMembers, xCompoundObservationConcept);
        var abnormalityObservation = findAbnormalityObservation(compoundObservation.groupMembers) || newAbnormalityObservation(xCompoundObservationConcept);
        return new this(compoundObservation, primaryObservation, primaryConcept, abnormalityObservation, conceptUIConfig);
    }

    Bahmni.ConceptSet.CompundObservationNode.createNew = function(primaryObservation, primaryConcept, xCompoundObservationConcept, conceptUIConfig) {
        var compoundObservation = createObservation(xCompoundObservationConcept, [primaryObservation]);
        var abnormalityObservation = newAbnormalityObservation(xCompoundObservationConcept);
        return new this(compoundObservation, primaryObservation, primaryConcept, abnormalityObservation, conceptUIConfig);
    }
})();


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
        if (this._isCoded()) return this.getConceptConfig().autocomplete ? "autocomplete" : "dropdown";
        return "unknown";
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
        if(this.primaryObservation.value) {
            var valueInRange = this.primaryObservation.value < (this.hiAbsolute|| Infinity) && this.primaryObservation.value > (this.lowAbsolute|| 0);
            this.abnormalityObservation.value = !valueInRange;
        } else {
            this.abnormalityObservation.value = undefined;
        }
    },

    onValueChanged: function () {
        this.primaryObservation.observationDateTime = new Date();
        if(this._isNumeric()){
            this.validateNumericValue();
        }
    },

    hasValue: function() {
        return this.primaryObservation.value ? true : false;
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
        var date = new Date(this.primaryObservation.value);
        return date.getUTCFullYear() && date.getUTCFullYear().toString().length <= 4;
    }
};