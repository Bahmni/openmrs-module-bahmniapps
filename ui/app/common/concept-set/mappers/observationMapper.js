'use strict';

Bahmni.ConceptSet.ObservationMapper = function (uiConfig, compoundConcept) {
    this.uiConfig = uiConfig;
    this.compoundConcept = compoundConcept;
    var CompundObservationNode = Bahmni.ConceptSet.CompundObservationNode;

    var self = this,
        conceptMapper = new Bahmni.ConceptSet.ConceptMapper(), 
        newCompondObservationNode = function (concept) {
            var primaryObservation = { concept: conceptMapper.map(concept), groupMembers: []};
            return CompundObservationNode.createNew(primaryObservation, concept, self.compoundConcept, self.uiConfig);
        }, 
        
        findInSavedObservation = function (observations, concept) {
            return observations.filter(function(observation){
                return observation.groupMembers && observation.groupMembers.some(function (obs) {
                    return concept.uuid === obs.concept.uuid;
                });
            })[0];
        }, 
        
        mapObservationGroupMembers = function (node, conceptSetMembers) {
            var savedObservations = node.primaryObservation.groupMembers;
            return conceptSetMembers.map(function (memberConcept) {
                var childNode = mapObservation(memberConcept, savedObservations);
                node.addChild(childNode);
                return childNode.compoundObservation;
            });
        }, 
        
        mapObservation = function (concept, savedObservations) {
            var compoundObservation = findInSavedObservation(savedObservations, concept);
            var node = compoundObservation ? CompundObservationNode.create(compoundObservation, concept, self.compoundConcept, self.uiConfig) : newCompondObservationNode(concept)
            if (concept.set) {
                node.primaryObservation.groupMembers = mapObservationGroupMembers(node, concept.setMembers);
            }
            return node;
        };

    this.map = function (observations, rootConcept) {
        return mapObservation(rootConcept, observations || []);
    };
};
