Bahmni.Opd.ObservationMapper = function (encounterConfig) {
    var findObservation = function (observations, concept) {
        for (var i = 0; i < observations.length; i++) {
            if (observations[i].concept.uuid === concept.uuid) {
                return observations[i];
            }
            if (observations[i].groupMembers) {
                var observation = findObservation(observations[i].groupMembers, concept);
                if (observation) return observation;
            }
        }
        return null;
    };

    var constructConceptToObsMap = function (conceptSet, observations, conceptToObservationMap) {
        conceptSet.forEach(function (concept) {
            if (concept.set) {
                constructConceptToObsMap(concept.setMembers, observations, conceptToObservationMap);
            }
            else {
                var obs = { concept: { uuid: concept.uuid}, observationUuid: "", value: "" };
                if (concept.answers.length > 0) obs.possibleAnswers = concept.answers;

                if (observations && observations.length > 0) {
                    var observation = findObservation(observations, concept);
                    if (observation && observation.concept.uuid === concept.uuid) {
                        if (observation.value instanceof Object) {
                            obs.value = observation.value.uuid;
                        } else {
                            obs.value = observation.value;
                        }
                        obs.observationUuid = observation.uuid
                    }
                }
                conceptToObservationMap[concept.uuid] = angular.extend(new Bahmni.Opd.Consultation.Observation(), obs);
            }
        });
        return conceptToObservationMap;
    };

    this.map = function (visit, conceptSet) {
        var opdEncounter = visit.encounters.filter(function (encounter) {
            return encounter.encounterType.uuid === encounterConfig.getOpdConsultationEncounterUuid();
        })[0];

        var observations = null;
        var conceptToObservationMap = {};
        if (opdEncounter) {
            observations = opdEncounter.obs;
        }
        return constructConceptToObsMap(conceptSet, observations, conceptToObservationMap)
    };
};
