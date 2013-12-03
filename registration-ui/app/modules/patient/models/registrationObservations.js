var RegistrationObservations = (function () {

    function RegistrationObservations(encounterObservations, isNewPatient, encounterConfig) {
        this.observations = encounterObservations.observations.map(function (obs) {
            return new ObservationData(obs.uuid, obs.concept, obs.value)
        });
        defaultRegistrationFees(this.observations, isNewPatient, encounterConfig);
        addRequiredConceptObservations(this.observations, encounterConfig.conceptData);
    }

    RegistrationObservations.prototype.updateObservations = function (updatedObservations) {
        this.observations.forEach(function (observationData) {
            var newObservationValue = updatedObservations[observationData.concept.name];
            if(!newObservationValue && observationData.value){
                observationData.voided = true;
            }else if(newObservationValue){
                observationData.value = newObservationValue;
            }
        });

        var obsToSave = this.observations.filter(function(obs){
            return obs.value || obs.voided;
        });

        return obsToSave;
    };

    var defaultRegistrationFees = function (observations, isNewPatient, encounterConfig) {
        registrationFeesUUID = encounterConfig.getConceptUUID(constants.registrationFeesConcept);
        registrationFee = getConceptObservation(observations, registrationFeesUUID);
        if (registrationFee === null) {
            observations.push(new ObservationData(null, {uuid: registrationFeesUUID, name: constants.registrationFeesConcept}, defaults.registration_fees(isNewPatient)));
        }
    };

    var getConceptObservation = function (observations, conceptUuid) {
        var filteredObs = observations.filter(function (observation) {
            return observation.concept.uuid == conceptUuid
        });
        return filteredObs.length > 0 ? filteredObs[0] : null;
    };

    var addRequiredConceptObservations = function (observations, configuredEncounterConcepts) {
        Object.getOwnPropertyNames(configuredEncounterConcepts).forEach(function (configuredConceptName) {
            var configuredConcept = configuredEncounterConcepts[configuredConceptName];
            var filteredObservation = observations.filter(function (observation) {
                return observation.concept.uuid === configuredConcept.uuid
            });
            if (filteredObservation.length == 0) {
                observations.push(new ObservationData(null, {uuid: configuredConcept.uuid, name: configuredConceptName}, null));
            }
        });
    };

    return RegistrationObservations;
})();

var ObservationData = (function () {
    function ObservationData(uuid, concept, value) {
        this.uuid = uuid;
        this.concept = concept;
        this.value = value;
    }

    return ObservationData;
})();