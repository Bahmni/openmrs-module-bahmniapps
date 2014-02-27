Bahmni.ConceptSet.ObservationMapper = function () {
    var newObservation = function (concept) {
        var observation = { concept: mapConcept(concept), units: concept.units, label: concept.display, possibleAnswers: concept.answers, groupMembers: []};
        return new Bahmni.ConceptSet.Observation(observation);
    };

    var mapConcept = function(openMrsConcept) {
        return {
            uuid: openMrsConcept.uuid,
            name: openMrsConcept.name.name,
            set: openMrsConcept.set,
            datatype: openMrsConcept.datatype,
            hiAbsolute: openMrsConcept.hiAbsolute,
            lowAbsolute: openMrsConcept.lowAbsolute
        }
    }

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
        }
        var savedObsGroupMembers = savedObs ? savedObs.groupMembers  : [];
        observation.groupMembers = concept.set ? mapObservationGroupMembers(savedObsGroupMembers, concept.setMembers) : [];
        return observation;
    };

    this.map = function (observations, rootConcept) {
        return mapObservation(rootConcept, observations || []);
    };
};
