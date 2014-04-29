'use strict';

(function(){    
    Bahmni.ConceptSet.MultiValueCompundObservation = function(compoundObservation, primaryConcept, compoundObservationConcept) {
        var ArrayUtil = Bahmni.Common.Util.ArrayUtil;
        angular.extend(this, new Bahmni.ConceptSet.CompundObservation(compoundObservation, primaryConcept, compoundObservationConcept));
        
        var removeObservation = function(observation) {
                if(observation.uuid) { observation.voided = true; }
                else { ArrayUtil.removeItem(compoundObservation.groupMembers, observation); }
            },

            getPrimaryObservations = function() {
                var existingObservations = compoundObservation.groupMembers.filter(function(member) { return !member.voided });
                return existingObservations.filter(function(observation){ return observation.concept.uuid === primaryConcept.uuid });
            },

            getPrimaryObservationWithValue = function(answerConcept) {
                return compoundObservation.groupMembers.filter(function(member){ 
                    return member.concept.uuid === primaryConcept.uuid && member.value.uuid === answerConcept.uuid;
                })[0];
            },

            createObservation = function(concept, value) {
                return { concept: concept, value: value, groupMembers: []};
            },
            
            addPrimaryObservationWithValue = function(answerConcept) {
                var existingObservation = getPrimaryObservationWithValue(answerConcept);
                if(existingObservation) {
                    existingObservation.voided = false;
                } 
                else {
                    compoundObservation.groupMembers.push(createObservation(primaryConcept, answerConcept));
                }
            }; 

        this.getValue = function() {
            return getPrimaryObservations().map(function(concept){ return concept.value; });
        }

        this.setValue = function(answerConcepts) {
            answerConcepts.forEach(addPrimaryObservationWithValue);
            var observationsWithDeletdValues = getPrimaryObservations().filter(function(member){
                return !answerConcepts.some(function(answerConcept){ return member.value.uuid === answerConcept.uuid; });
            });
            observationsWithDeletdValues.forEach(removeObservation);
        }
    }
})();