Bahmni.ConceptSet.ObservationMapper = function (encounterConfig) {

    var newObservation = function (concept) {
        var observation = { concept: { uuid: concept.uuid }, units: concept.units, label: concept.display, possibleAnswers: []};
        if (concept.answers.length > 0) observation.possibleAnswers = concept.answers;
        observation = angular.extend(new Bahmni.Opd.Consultation.Observation(), observation);
        return observation;
    };

    var newFromSavedObservation = function (concept, savedObservation) {
        var observation = newObservation(concept);
        if (savedObservation && savedObservation.concept.uuid === concept.uuid) {
            observation.uuid = savedObservation.uuid;
        }
        if (savedObservation.value instanceof Object) {
            observation.value = savedObservation.value.uuid;
        } else {
            observation.value = savedObservation.value;
        }
        return observation;
    };

    var findInSavedObservation = function (concept, observations) {
        if (!observations) return null;
        return observations.filter(function (obs) {
            return concept.uuid === obs.concept.uuid;
        })[0];
    };

    var mapObservationGroupMembers = function (observation, savedObservations, conceptSetMembers) {
        var groupMembers = [];
        conceptSetMembers.forEach(function (memberConcept) {
            var setMember = mapObservation(memberConcept, savedObservations);
            if (setMember)
                groupMembers.push(setMember);
        });
        observation.groupMembers = groupMembers;
        return observation;
    };

    var mapObservation = function (concept, savedObservations) {
        var savedObs = findInSavedObservation(concept, savedObservations);
        var observation = null;
        if (savedObs) {
            observation = newFromSavedObservation(concept, savedObs);
        } else {
            observation = newObservation(concept);
        }
        if (concept.set) {
            var savedGroupMembers = [];
            if (savedObs) savedGroupMembers = savedObs.groupMembers;
            mapObservationGroupMembers(observation, savedGroupMembers, concept.setMembers);
        }
        return observation;
    };

    this.map = function (visit, rootConcept) {
        var encounter = visit.encounters.filter(function (encounter) {
            return encounter.encounterType.uuid === encounterConfig.getOpdConsultationEncounterUuid();
        })[0];

        var allSavedObs = [];
        if (encounter) {
            allSavedObs = encounter.obs;
        }
        return mapObservation(rootConcept, allSavedObs);
    };
};
