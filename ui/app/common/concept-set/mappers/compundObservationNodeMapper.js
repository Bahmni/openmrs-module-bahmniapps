'use strict';

Bahmni.ConceptSet.CompundObservationNodeMapper = function (uiConfig, compoundConcept) {
    this.uiConfig = uiConfig;
    this.compoundConcept = compoundConcept;
    var CompundObservationNode = Bahmni.ConceptSet.CompundObservationNode;

    var self = this,
        conceptMapper = new Bahmni.ConceptSet.ConceptMapper(),
        newCompoundObservation = function (concept) {
            return { concept: conceptMapper.map(compoundConcept), groupMembers: []};
        },

        findCompoundObservation = function (observations, concept) {
            return observations.filter(function (observation) {
                return observation.groupMembers && observation.groupMembers.some(function (obs) {
                    return obs && concept.uuid === obs.concept.uuid;
                });
            })[0];
        },

        mapObservationGroupMembers = function (concepts, observations) {
            return concepts.map(function (concept) { return createNode(concept, observations); });
        },

        createNode = function (concept, observations) {
            var compoundObservation = findCompoundObservation(observations, concept) || newCompoundObservation(concept);
            var node = new CompundObservationNode(compoundObservation, concept, self.compoundConcept, self.uiConfig[concept.name.name]);
            if(concept.set && node.primaryObservation) {
                node.children = mapObservationGroupMembers(concept.setMembers, node.primaryObservation.groupMembers);
                node.primaryObservation.groupMembers = node.children.map(function(childNode) { return childNode.compoundObservation; });
            }
            return node;
        };

    this.map = function (observations, rootConcept) {
        return createNode(rootConcept, observations || []);
    };
};
