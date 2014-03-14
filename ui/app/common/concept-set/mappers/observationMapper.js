Bahmni.ConceptSet.ObservationMapper = function () {
    var conceptMapper = new Bahmni.ConceptSet.ConceptMapper();
    
    var newObservation = function (concept, conceptUIConfig) {
        var observation = { concept: conceptMapper.map(concept), units: concept.units, label: concept.display, possibleAnswers: concept.answers, groupMembers: []};
        return new Bahmni.ConceptSet.Observation(observation, conceptUIConfig);
    };

    var findInSavedObservation = function (concept, observations) {
        return observations.filter(function (obs) {
            return concept.uuid === obs.concept.uuid;
        })[0];
    };

    var mapObservationGroupMembers = function (savedObservations, conceptSetMembers, conceptSetconfig) {
        return conceptSetMembers.map(function (memberConcept) {
            return mapObservation(memberConcept, savedObservations, conceptSetconfig[memberConcept.name.name] || {});
        });
    };

    var mapObservation = function (concept, savedObservations, conceptSetconfig) {
        var observation = newObservation(concept, conceptSetconfig);
        var savedObs = findInSavedObservation(concept, savedObservations);
        if (savedObs) {
            observation.uuid = savedObs.uuid;
            observation.value = savedObs.value;
        }
        var savedObsGroupMembers = savedObs ? savedObs.groupMembers  : [];
        observation.groupMembers = concept.set ? mapObservationGroupMembers(savedObsGroupMembers, concept.setMembers, conceptSetconfig) : [];
        return observation;
    };

    this.map = function (observations, rootConcept, conceptSetconfig) {
        return mapObservation(rootConcept, observations || [], conceptSetconfig);
    };
};
