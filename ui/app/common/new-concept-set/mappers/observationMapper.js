Bahmni.ConceptSet.ObservationMapper = function () {
    var conceptMapper = new Bahmni.ConceptSet.ConceptMapper();

    // tODO : remove conceptUIConfig
    var newObservation = function (concept, savedObs) {
        var observation = { concept: conceptMapper.map(concept), units: concept.units, label: concept.display, possibleAnswers: concept.answers, groupMembers: []};
        return new Bahmni.ConceptSet.Observation(observation, savedObs);
    };


    var findInSavedObservation = function (concept, observations) {
        return observations.filter(function (obs) {
            return concept.uuid === obs.concept.uuid;
        })[0];
    };

    var mapObservationGroupMembers = function (savedObservations, conceptSetMembers, conceptSetConfig) {
        var observationGroupMembers = [];
        conceptSetMembers.forEach(function (memberConcept) {
            observationGroupMembers.push(mapObservation(memberConcept, savedObservations, conceptSetConfig[memberConcept.name.name] || {}))
        });
        return observationGroupMembers;
    };

    var newObservationNode = function (concept, savedObsNode, conceptSetUIConfig) {
        var observation = { concept: conceptMapper.map(concept), units: concept.units, label: concept.display, possibleAnswers: concept.answers, groupMembers: []};
        return new Bahmni.ConceptSet.ObservationNode(observation, savedObsNode, conceptSetUIConfig);
    };

    var mapObservation = function (concept, savedObservations, conceptSetUIConfig) {
        var savedObs = findInSavedObservation(concept, savedObservations);
        if (savedObs && (savedObs.isObservation || savedObs.isObservationNode)) return savedObs;

        var observation;
        if (concept.conceptClass.name === Bahmni.Common.Constants.conceptDetailsClassName) {
            observation = newObservationNode(concept, savedObs, conceptSetUIConfig);
        } else {
            observation = newObservation(concept, savedObs);
        }

        var savedObsGroupMembers = savedObs ? savedObs.groupMembers : [];
        observation.groupMembers = concept.set ? mapObservationGroupMembers(savedObsGroupMembers, concept.setMembers, conceptSetUIConfig) : [];

        return observation;
    };

    this.map = function (observations, rootConcept, conceptSetConfig) {
        return mapObservation(rootConcept, observations || [], conceptSetConfig);
    };
};
