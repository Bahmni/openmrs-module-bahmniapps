Bahmni.Opd.DispositionMapper = function(encounterConfig,dispositionNoteConcept) {
    this.map = function(visit) {
        var disposition ={};
        var opdEncounter = visit.encounters.filter(function(encounter){
            return encounter.encounterType.uuid === encounterConfig.getOpdConsultationEncounterUUID();
        })[0];

        if (opdEncounter) {

            var dispositionOrder = opdEncounter.orders.filter(function(order){
                return  order.orderType ? order.orderType.display == Bahmni.Opd.Constants.dispositionOrderType :false;
            });

            disposition.dispositionNotes = opdEncounter.obs.filter(function(observation){
                return observation.concept.uuid === dispositionNoteConcept.uuid;
            })
        }
        else {
            return;
        };

        var order = {
           order :{
               conceptUUID : dispositionOrder[0].concept.uuid,
               orderType :  dispositionOrder[0].orderType.display
           },
           name : dispositionOrder[0].display
        }

        return {
            dispositionNotes : disposition.dispositionNotes[0],
            dispositionOrder : order
        };
    }
};
