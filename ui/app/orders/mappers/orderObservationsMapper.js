Bahmni.Orders.OrderObservationsMapper = function() {
    this.map = function(order,rootConcept, activeEncounter, orderObservations) {
        var mappedObservation={};
        var conceptObsMap = {};

        var activeEncounterOrderObservations = _.filter(activeEncounter.observations, function(observation){
            return observation.orderUuid === order.uuid && observation.concept.uuid === rootConcept.uuid;
        });
        if(activeEncounterOrderObservations.length > 0) {
            mappedObservation = _.clone(activeEncounterOrderObservations[0]);
            activeEncounterOrderObservations.forEach(function(obs) {
                obs.groupMembers.forEach(function(firstLevelObs) {
                    if(conceptObsMap[firstLevelObs.concept.uuid] == null) {
                        conceptObsMap[firstLevelObs.concept.uuid] = firstLevelObs;
                    }
                })
            });
            mappedObservation.groupMembers = [];
        }else{
            mappedObservation.concept = rootConcept;
            mappedObservation.uuid = undefined;
            mappedObservation.groupMembers = [];
            mappedObservation.voided = false;
            mappedObservation.value = null;
            mappedObservation.encounterUuid = activeEncounter.encounterUuid;
        }
        orderObservations.forEach(function(previousObservation){
            previousObservation.groupMembers.forEach(function(obs){
               if(!conceptObsMap.hasOwnProperty(obs.concept.uuid)){
                   conceptObsMap[obs.concept.uuid]=obs;
               }
            });
        });
        Object.keys(conceptObsMap).forEach(function(concept){
            mappedObservation.groupMembers.push(conceptObsMap[concept]);
        });

        var addFlagIfObsBelongsToPreviousEncounter = function(observations) {
            observations.forEach(function(observation) {
                if(observation.encounterUuid === activeEncounter.encounterUuid){
                    observation.belongsToPreviousEncounter = false;
                }else{
                    observation.belongsToPreviousEncounter = true;
                };

                addFlagIfObsBelongsToPreviousEncounter(observation.groupMembers || []);
            });
        }

        addFlagIfObsBelongsToPreviousEncounter([mappedObservation]);

        return [mappedObservation];
    }
}