'use strict';

(function(){    
    Bahmni.ConceptSet.SingleValueCompundObservation = function(compoundObservation, primaryConcept, compoundObservationConcept) {
        this.primaryObservation = findPrimaryObservation(compoundObservation.groupMembers, compoundObservationConcept);
        if(!this.primaryObservation) {
            this.primaryObservation =  { concept: primaryConcept, groupMembers: []};
            compoundObservation.groupMembers.push(this.primaryObservation);
        }

        angular.extend(this, new Bahmni.ConceptSet.CompundObservation(compoundObservation, primaryConcept, compoundObservationConcept));

        this.getValue = function() {
          return this.primaryObservation.value;  
        }

        this.setValue = function(value) {
            this.primaryObservation.value = value;
            this.primaryObservation.observationDateTime = new Date();
        }
    }

    var findPrimaryObservation = function(observations, compoundObservationConcept) {
        var compundObservationMemberUuids = compoundObservationConcept.setMembers.map(function(member) { return member.uuid; });
        return observations.filter(function(observation) {
            return compundObservationMemberUuids.indexOf(observation.concept.uuid) === -1; 
        })[0];
    };
})();