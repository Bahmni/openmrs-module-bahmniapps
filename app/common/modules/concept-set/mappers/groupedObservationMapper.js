Bahmni.Opd.GroupedObservationMapper = function (encounterConfig) {

    var mapValue = function (observation, obs) {
        if (observation.value instanceof Object) {
            obs.value = observation.value.uuid;
        } else {
            obs.value = observation.value;
        }
    };

    var newFromSavedObservation = function (concept, observation) {
        var obs = { concept: { uuid: concept.uuid } };
        if (observation && observation.concept.uuid === concept.uuid) {
            obs.observationUuid = observation.uuid;
        }
        return obs;
    };

    var newFromUIObservation = function (concept, observation) {
        var obs = { concept: { uuid: concept.uuid } };
        if (observation && observation.conceptUuid === concept.uuid) {
            obs.observationUuid = observation.observationUuid;
        }
        return obs;
    };

    var findInUIObservation = function (concept, observations) {
        if (!observations) return null;
        return observations.filter(function (obs) {
            return concept.uuid === obs.conceptUuid;
        })[0];
    };

    var findInSavedObservation = function (concept, observations) {
        if (!observations) return null;
        return observations.filter(function (obs) {
            return concept.uuid === obs.concept.uuid;
        })[0];
    };

    var mapObservationGroupMembers = function (observation, savedObses, conceptSetMembers, uiObservations) {
        var groupMembers = [];
        conceptSetMembers.forEach(function (memberConcept) {
            var setMember = mapObservation(memberConcept, savedObses, uiObservations);
            if (setMember)
                groupMembers.push(setMember);
        });
        observation.groupMembers = groupMembers;
        return observation;
    };

    var mapObservation = function (concept, savedObses, uiObservations) {
        var observation = null;
        var savedObs = findInSavedObservation(concept, savedObses);
        if (concept.set) {
            observation = newFromSavedObservation(concept, savedObs);
            var savedGroupMembers = [];
            if (savedObs) savedGroupMembers = savedObs.groupMembers;
            mapObservationGroupMembers(observation, savedGroupMembers, concept.setMembers, uiObservations);
        } else {
            var uiObservation = findInUIObservation(concept, uiObservations);
            if (uiObservation && uiObservation.value) {
                observation = newFromUIObservation(concept, uiObservation);
                mapValue(uiObservation, observation);
            }
        }
        return observation;
    };

    this.map = function (visit, rootConcept, uiObservations) {
        var encounter = visit.encounters.filter(function (encounter) {
            return encounter.encounterType.uuid === encounterConfig.getOpdConsultationEncounterUuid();
        })[0];

        var allSavedObs = [];
        if (encounter) {
            allSavedObs = encounter.obs;
        }
        return mapObservation(rootConcept, allSavedObs, uiObservations);
    };
};
