'use strict';

(function(){    
    Bahmni.ConceptSet.CompundObservation = function(compoundObservation, primaryConcept, compoundObservationConcept) {
        this.abnormalityObservation = findObservation(compoundObservation.groupMembers, Bahmni.Common.Constants.abnormalObservationConceptName);
        if(!this.abnormalityObservation) {
            this.abnormalityObservation = newAbnormalityObservation(compoundObservationConcept);
            compoundObservation.groupMembers.push(this.abnormalityObservation);
        }
    }

    var findObservation = function(observations, name) {
        return observations.filter(function(observation) { return observation.concept.name === name; })[0];
    };

    var findConcept = function(concepts, name) {
        return concepts.filter(function(member) { return member.name.name === name; })[0];
    };

    var newAbnormalityObservation = function(compoundObservationConcept) {
        var abnormalityConcept = findConcept(compoundObservationConcept.setMembers, Bahmni.Common.Constants.abnormalObservationConceptName);
        return {concept: new Bahmni.ConceptSet.ConceptMapper().map(abnormalityConcept), groupMembers: []};
    };
})();