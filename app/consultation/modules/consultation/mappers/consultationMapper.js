Bahmni.Opd.ConsultationMapper = function(encounterConfig) {
    this.map = function(visit) {
        var investigations = [];
        var opdEncounter = visit.encounters.filter(function(encounter){
            return encounter.encounterType.uuid === encounterConfig.getOpdConsultationEncounterUUID();
        })[0];
        
        if (opdEncounter) {
            var testOrders = opdEncounter.orders.filter(function(order){
                return order.orderType && Bahmni.Opd.Constants.testOrderTypes.indexOf(order.orderType.display) >= 0;
            });
            investigations = testOrders.map(function(testOrder){
                return { uuid: testOrder.concept.uuid, name: testOrder.concept.display,
                         isSet: testOrder.concept.set, orderTypeUuid: testOrder.orderType.uuid };
            });    
        };                
        
        return {investigations: investigations};
    }
};                                
