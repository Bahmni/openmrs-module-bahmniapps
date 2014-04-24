Bahmni.ConceptSet.ObservationMapper = function () {
    var conceptMapper = new Bahmni.ConceptSet.ConceptMapper();

    // tODO : remove conceptUIConfig
    var newObservation = function (concept) {
        var observation = { concept: conceptMapper.map(concept), units: concept.units, label: concept.display, possibleAnswers: concept.answers, groupMembers: []};
        return new Bahmni.ConceptSet.Observation(observation);
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

    var mapAbnormal = function(savedObservations, conceptSetMembers, conceptSetConfig) {
        var abnormal;
        conceptSetMembers.forEach(function (memberConcept) {
            if (memberConcept.conceptClass.name === Bahmni.Common.Constants.abnormalConceptClassName) {
                 abnormal = mapObservation(memberConcept, savedObservations, conceptSetConfig[memberConcept.name.name] || {});
            }
        });
        return abnormal;
    };

    var mapPrimaryObs = function(savedObservations, conceptSetMembers, conceptSetConfig) {
        var primaryObs;
        conceptSetMembers.forEach(function (memberConcept) {
            if (memberConcept.conceptClass.name === Bahmni.Common.Constants.miscConceptClassName) {
                primaryObs = mapObservation(memberConcept, savedObservations, conceptSetConfig[memberConcept.name.name] || {});
            }
        });
        return primaryObs;
    };

    var newObservationNode = function (concept, abnormal, primaryObs, savedObsNode, conceptSetUIConfig) {
        var observation = { concept: conceptMapper.map(concept), units: concept.units, label: concept.display, possibleAnswers: concept.answers, groupMembers: []};
        return new Bahmni.ConceptSet.ObservationNode(observation, abnormal, primaryObs, savedObsNode, conceptSetUIConfig);
    };

    var mapObservation = function (concept, savedObservations, conceptSetUIConfig) {
        var savedObs = findInSavedObservation(concept, savedObservations);
        var savedObsGroupMembers = savedObs ? savedObs.groupMembers : [];

        if (concept.conceptClass.name === Bahmni.Common.Constants.conceptDetailsClassName) {
            var abnormal = mapAbnormal(savedObsGroupMembers, concept.setMembers, conceptSetUIConfig);
            var primaryObs = mapPrimaryObs(savedObsGroupMembers, concept.setMembers, conceptSetUIConfig);
            var savedObsNode = findInSavedObservation(concept, savedObservations);
            return newObservationNode(concept, abnormal, primaryObs, savedObsNode, conceptSetUIConfig);
        } else {
            var observation = newObservation(concept, conceptSetUIConfig);
            if (savedObs) {
                observation.uuid = savedObs.uuid;
                observation.value = savedObs.value;
            }
            observation.groupMembers = concept.set ? mapObservationGroupMembers(savedObsGroupMembers, concept.setMembers, conceptSetUIConfig) : [];
            return observation;
        }
    };

    this.map = function (observations, rootConcept, conceptSetConfig) {
        return mapObservation(rootConcept, observations || [], conceptSetConfig);
    };
};
