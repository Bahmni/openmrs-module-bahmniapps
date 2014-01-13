Bahmni.ConceptSet.ObservationMapper = function (encounterConfig) {
    var newObservation = function (concept) {
        var observation = { concept: concept, units: concept.units, label: concept.display, possibleAnswers: concept.answers, groupMembers: []};
        return angular.extend(new Bahmni.ConceptSet.Observation(), observation);
    };

    var findInSavedObservation = function (concept, observations) {
        return observations.filter(function (obs) {
            return concept.uuid === obs.concept.uuid;
        })[0];
    };

    var mapObservationGroupMembers = function (savedObservations, conceptSetMembers) {
        return conceptSetMembers.map(function (memberConcept) {
            return mapObservation(memberConcept, savedObservations);
        });
    };

    var mapObservation = function (concept, savedObservations) {
        var observation = newObservation(concept);
        var savedObs = findInSavedObservation(concept, savedObservations);
        if (savedObs) {
            observation.uuid = savedObs.uuid;
            observation.value = savedObs.value instanceof Object ? savedObs.value.uuid : savedObs.value;
            observation.groupMembers = concept.set ? mapObservationGroupMembers(savedObs.groupMembers, concept.setMembers) : [];
        }
        return observation;
    };

    this.map = function (encounterTransaction, rootConcept) {
        var allSavedObs = encounterTransaction ? encounterTransaction.observations : [];
        return mapObservation(rootConcept, allSavedObs);
    };
};
