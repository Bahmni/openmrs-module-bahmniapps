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
        return this.primaryObservation.groupMembers && this.primaryObservation.groupMembers.length;
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
        var valueInRange = this.primaryObservation.value < (this.hiAbsolute|| Infinity) && this.primaryObservation.value > (this.lowAbsolute|| 0);
        this.abnormalityObservation.value = this.primaryObservation.value && !valueInRange;
    },

    onValueChanged: function () {
        this.primaryObservation.observationDateTime = new Date();
        if(this._isNumeric()){
            this.validateNumericValue();
        }
    },

    isValid: function(checkRequiredFields) {
        return this._checkValidity(checkRequiredFields);
    },

    atLeastOneValueSet: function () {
        return this._atLeastOneValueSet(false);
    },

    _atLeastOneValueSet: function (isSet) {
        if (this.isGroup()) {
            this.children.forEach(function(childNode){
                if (childNode.isGroup()) {
                    if (childNode._atLeastOneValueSet()) {
                        isSet = true;
                    }
                }
                else if (childNode.primaryObservation.value) {
                    isSet = true;
                }
            });

        }
        return isSet;
    },

    _checkValidity: function (checkRequiredFields) {
        if (this.isGroup()) {
            this.children.forEach(function(childNode){
                if (!childNode._checkValidity(checkRequiredFields)) {
                    return false;
                }
            });
            return true;
        } else if (this._isDateDataType()) {
            return this.isValidDate();
        }
        if (checkRequiredFields && this.isValidRequiredField()) {
            return false;
        }
        return true;
    },

    isValidRequiredField: function() {
        return this.isRequired && !(this.primaryObservation.value)
    },

    isValidDate: function () {
        if (!this.primaryObservation.value) { // to allow switching to other tabs, if not date is entered
            return true;
        }
        var date = new Date(this.primaryObservation.value);
        return date.getUTCFullYear() && date.getUTCFullYear().toString().length <= 4;
    }
};