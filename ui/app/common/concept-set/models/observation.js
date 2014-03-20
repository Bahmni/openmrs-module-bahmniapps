'use strict';

Bahmni.ConceptSet.Observation = function (observation, conceptUIConfig, xCompoundObservationConcept) {
    var xObservation,
    createConcept = function(baseConcept, groupMembers) {
        return {concept: {
                    name: baseConcept.name.name,
                    uuid: baseConcept.uuid
                },
                groupMembers: groupMembers || []
            };
    },
    findConcept = function(name) {
        return xCompoundObservationConcept.setMembers.filter(function(member) {
            return member.name.name === name;
        })[0];
    },
    shouldMarkAsAbnormal = function(conceptName) {
        return conceptUIConfig[conceptName] && conceptUIConfig[conceptName].showAbnormalIndicator;
    };

    xObservation = createConcept(xCompoundObservationConcept, [observation]);
    if (shouldMarkAsAbnormal(observation.concept.name)) {
        var abnormal = createConcept(findConcept('IS_ABNORMAL'));
        this.isAbnormal = abnormal;
        xObservation.groupMembers.push(abnormal);
    }
    angular.extend(this, xObservation);
    this.conceptUIConfig = conceptUIConfig;
    this.observation = observation;
};

Bahmni.ConceptSet.Observation.create = function(obs, xCompoundObservationConcept, conceptUIConfig) {
    var Observation = function(observation){
        var findObservation = function(observations) {
            var finalObservation, 
            invalidConcepts = xCompoundObservationConcept.setMembers.map(function(member) {
                return member.uuid;
            });

            observations.forEach(function(observation) {
                var observationUuid = observation.concept.uuid;
                if (invalidConcepts.indexOf(observationUuid) < 0) {
                    finalObservation = observation;
                }
            });
            return finalObservation;
        },
        findAbnormal = function(observations) {
            return observations.filter(function(observation) {
                return observation.concept.name === "IS_ABNORMAL";
            })[0];
        };

        angular.extend(this, observation);
        this.observation = findObservation(observation.groupMembers);
        this.isAbnormal = findAbnormal(observation.groupMembers);
        this.groupMembers.push(this.observation);
        this.isAbnormal && this.groupMembers.push(this.isAbnormal);
    };

    Observation.prototype = Bahmni.ConceptSet.Observation.prototype;
    
    return new Observation(obs);
}

Bahmni.ConceptSet.Observation.prototype = {
    displayValue: function () {
        if (this.observation.possibleAnswers.length > 0) {
            for (var i = 0; i < this.observation.possibleAnswers.length; i++) {
                if (this.observation.possibleAnswers[i].uuid === this.observation.value) {
                    return this.observation.possibleAnswers[i].display;
                }
            }
        } else {
            return this.observation.value;
        }
    },

    getPossibleAnswers: function(){
        return this.observation.possibleAnswers;
    },

    getConceptName: function() {
        return this.observation.concept.name;
    },

    getConceptConfig: function() {
        return this.conceptUIConfig[this.getConceptName()] || {};
    },

    getIsAbnormal : function() {
        return this.isAbnormal;
    },

    setIsAbnormal: function(abnormal) {
        if (abnormal && this.isAbnormal) {
            this.isAbnormal.uuid = abnormal.uuid;
            if (typeof(abnormal.value) === "boolean") {
                this.isAbnormal.value = abnormal.value;
            } else {
                this.isAbnormal.value = abnormal.value ? abnormal.value.trim().toLowerCase() === "true" : false;
            }
        }
    },

    getUuid: function() {
        return this.observation.uuid;
    },

    getValue: function() {
        return this.observation.value;
    },

    setUuid: function(uuid) {
        this.observation.uuid = uuid;
    },

    setValue: function(value){
        this.observation.value = value;
    },

    label: function() {
        return this.observation.label;
    },
    units: function() {
        return this.observation.units;
    },

    isGroup: function () {
        if (this.observation.groupMembers)
            return this.observation.groupMembers.length > 0;
        return false;
    },

    getGroupMembers: function() {
        return this.observation.groupMembers;
    },

    getControlType: function () {
        if (this.isHtml5InputDataType()) return "html5InputDataType";
        if (this.isText()) return "text";
        if (this.isCoded()) return this.getConceptConfig().autocomplete ? "autocomplete" : "dropdown";

        return "unknown";
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

    getDataTypeName: function () {
        return this.observation.concept.dataType;
    },

    isHtml5InputDataType: function () {
        return ['Date', 'Numeric'].indexOf(this.getDataTypeName()) != -1;
    },

    isDateDataType: function () {
        return 'Date'.indexOf(this.getDataTypeName()) != -1;
    },

    getHighAbsolute: function () {
        return this.observation.concept.hiAbsolute;
    },

    getLowAbsolute: function () {
        return this.observation.concept.lowAbsolute;
    },
    validateNumericValue: function(){
        var valueInRange = this.displayValue() < this.getHighAbsolute() && this.displayValue() > this.getLowAbsolute();
        if (!this.displayValue() || valueInRange) {
            this.isAbnormal.value = false;
        }else {
            this.isAbnormal.value = true;
        }
    },
    onValueChanged: function () {
        this.observation.observationDateTime = new Date();
        if(this.isNumeric()){
            this.validateNumericValue();
        }
    },

    getInputType: function () {
        return this.getDataTypeName();
    },

    isValid: function () {
        if (this.isGroup()) {
            for (var key in this.observation.groupMembers) {
                if (!this.observation.groupMembers[key].isValid()) {
                    return false;
                }
            }
            return true;
        } else if (this.isDateDataType()) {
            return this.isValidDate();
        }
        return true;
    },

    isValidDate: function () {
        if (!this.displayValue()) { // to allow switching to other tabs, if not date is entered
            return true;
        }
        var date = new Date(this.displayValue());
        return date.getUTCFullYear() && date.getUTCFullYear().toString().length <= 4;
    }
};