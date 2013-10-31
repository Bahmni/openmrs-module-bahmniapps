var RegistrationObservations = (function () {

    function RegistrationObservations(encounterObservations, isNewPatient, encounterConfig) {
        this.observations = encounterObservations.observations.map(function (obs) {
            return new ObservationData(obs.conceptUuid, obs.conceptName, obs.value)
        });
        defaultRegistrationFees(this.observations, isNewPatient, encounterConfig);
        addRequiredConceptObservations(this.observations, encounterConfig.conceptData);
    }

    RegistrationObservations.prototype.updateObservations = function (updatedObservations) {
        this.observations.forEach(function (observationData) {
            observationData.value = updatedObservations[observationData.conceptName];
        });

        return this.observations;
    };

    var defaultRegistrationFees = function (observations, isNewPatient, encounterConfig) {
        registrationFeesUUID = encounterConfig.getConceptUUID(constants.registrationFeesConcept);
        registrationFee = getConceptObservation(observations, registrationFeesUUID);
        if (registrationFee === null) {
            observations.push(new ObservationData(registrationFeesUUID, constants.registrationFeesConcept, defaults.registration_fees(isNewPatient)));
        }
    };

    var getConceptObservation = function (observations, conceptUuid) {
        var filteredObs = observations.filter(function (observation) {
            return observation.conceptUuid == conceptUuid
        });
        return filteredObs.length > 0 ? filteredObs[0] : null;
    };

    var addRequiredConceptObservations = function (observations, configuredEncounterConcepts) {
        Object.getOwnPropertyNames(configuredEncounterConcepts).forEach(function (configuredConceptName) {
            var configuredConcept = configuredEncounterConcepts[configuredConceptName];
            var filteredObservation = observations.filter(function (observation) {
                return observation.conceptUuid === configuredConcept.uuid
            });
            if (filteredObservation.length == 0) {
                observations.push(new ObservationData(configuredConcept.uuid, configuredConceptName, null));
            }
        });
    };

    return RegistrationObservations;
})();

var ObservationData = (function () {
    function ObservationData(conceptUuid, conceptName, value) {
        this.conceptUuid = conceptUuid;
        this.conceptName = conceptName;
        this.value = value;
    }

    return ObservationData;
})();