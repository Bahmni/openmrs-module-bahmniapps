
Bahmni.Opd.ObservationMapper = function(encounterConfig) {
    this.map = function(visit,conceptSet){
        var opdEncounter = visit.encounters.filter(function (encounter) {
            return encounter.encounterType.uuid === encounterConfig.getOpdConsultationEncounterUuid();
        })[0];

        var observations = null;

        var conceptToObservationMap= {};

        var constructConceptToObsMap = function(conceptSet,observations,conceptToObservationMap){

            conceptSet.forEach(function (concept) {
                if(concept.set) {
                    constructConceptToObsMap(concept.setMembers,observations,conceptToObservationMap);
                }
                else {
                    var obs = {
                        conceptUuid:concept.uuid,
                        observationUuid : "",
                        value:""
                    }
                    if(observations && observations.length > 0){
                        observations.forEach(function (observation) {
                            if (observation.concept.uuid === concept.uuid) {
                                obs.value = observation.value,
                                    obs.observationUuid = observation.uuid
                            }
                        })
                    }
                    conceptToObservationMap[concept.uuid] = obs;
                }
            })
            return conceptToObservationMap;
        }

        if (opdEncounter) {
            observations = opdEncounter.obs;
        }

        return {
            conceptToObservationMap:constructConceptToObsMap(conceptSet,observations,conceptToObservationMap)
        };

    }
}
