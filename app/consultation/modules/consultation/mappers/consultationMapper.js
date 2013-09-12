Bahmni.Opd.ConsultationMapper = function(encounterConfig) {
    this.map = function(visit) {
        var investigations = [];
        var opdEncounter = visit.encounters.filter(function(encounter){
            return encounter.encounterType.uuid === encounterConfig.getOpdConsultationEncounterUUID();
        })[0];
        
        if (opdEncounter) {
            var labOrders = opdEncounter.orders.filter(function(order){
                return order.orderType == null;
            });
            investigations = labOrders.map(function(labOrder){
                return {uuid: labOrder.concept.uuid, name: labOrder.concept.display };
            });    
        };                
        
        return {investigations: investigations};
    }
};                                
