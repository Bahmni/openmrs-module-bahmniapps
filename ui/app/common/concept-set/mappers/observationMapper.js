'use strict';

Bahmni.ConceptSet.ObservationMapper = function (uiConfig, compoundObservation) {
    this.uiConfig = uiConfig;
    this.compoundObservation = compoundObservation;

    var self = this,
    conceptMapper = new Bahmni.ConceptSet.ConceptMapper(), 
    newObservation = function (concept) {
        var observation = { concept: conceptMapper.map(concept), units: concept.units, label: concept.display, possibleAnswers: concept.answers, groupMembers: []};
        return new Bahmni.ConceptSet.Observation(observation, self.uiConfig, self.compoundObservation);
    }, 
    findInSavedObservation = function (concept, observations) {
        var savedObs = observations.filter(function(observation){
            return observation.groupMembers && observation.groupMembers.some(function (obs) {
                return concept.uuid === obs.concept.uuid;
            });
        })[0];

        return savedObs && Bahmni.ConceptSet.Observation.create(savedObs, self.compoundObservation, self.uiConfig);
    }, 
    mapObservationGroupMembers = function (savedObservations, conceptSetMembers) {
        return conceptSetMembers.map(function (memberConcept) {
            var newObs = mapObservation(memberConcept, savedObservations);
            return newObs;
        });
    }, 
    mapObservation = function (concept, savedObservations) {
        var observation = newObservation(concept);
        var savedObs = findInSavedObservation(concept, savedObservations);
        if (savedObs) {
            observation.uuid = savedObs.uuid;
            observation.value = savedObs.value;
            observation.setUuid(savedObs.getUuid());
            observation.setValue(savedObs.getValue());
            observation.setIsAbnormal(savedObs.getIsAbnormal());
        }
        var savedObsGroupMembers = savedObs ? savedObs.getGroupMembers()  : [];
        if (concept.set) {
            observation.observation.groupMembers = mapObservationGroupMembers(savedObsGroupMembers, concept.setMembers);
        }
        return observation;
    };

    this.map = function (observations, rootConcept) {
        var obs = observations.map(function(observation) {
            var newObs = Bahmni.ConceptSet.Observation.create(observation, self.compoundObservation, self.uiConfig);
            return newObs;
        })
        return mapObservation(rootConcept, obs || []);
    };
};
