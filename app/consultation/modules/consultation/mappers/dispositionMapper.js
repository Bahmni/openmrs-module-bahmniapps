Bahmni.Opd.DispositionMapper = function(encounterConfig,dispositionNoteConcept) {
    this.map = function(visit) {
        var opdEncounters = visit.encounters.filter(function(encounter){
            return encounter.encounterType.uuid === encounterConfig.getOpdConsultationEncounterUUID();
        })[0];


        var dispositions= [];

        if (opdEncounters) {
            opdEncounters.forEach(function(opdEncounter){
                var dispositionAction = opdEncounter.obs.filter(function(observation){
                    return  observation.concept ? observation.concept.uuid == Bahmni.Opd.Constants.dispositionConcept :false;
                });

                var dispositionNotes = opdEncounter.obs.filter(function(observation){
                    return observation.concept.uuid === dispositionNoteConcept.uuid;
                })

                var disposition ={
                    adtName: dispositionAction.value.display,
                    adtValueUuid : dispositionAction.value.uuid,
                    adtDateTime : dispositionAction.obsDateTime,
                    adtNoteValue : dispositionNotes.value,
                    adtNoteConcept : dispositionNoteConcept
                }
                dispositions.push(disposition);
            })

        }
        else {
            return;
        };

       /* var order = {
           order :{
               conceptUUID : dispositionOrder[0].concept.uuid,
               orderType :  dispositionOrder[0].orderType.display
           },
           name : dispositionOrder[0].display
        }*/

        return {
            /*dispositionNotes : disposition.dispositionNotes[0],
            dispositionOrder : order*/
            dispositions : dispositions
        };
    }
};
