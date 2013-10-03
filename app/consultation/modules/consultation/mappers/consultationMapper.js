Bahmni.Opd.ConsultationMapper = function (encounterConfig) {
    this.map = function (visit) {
        var investigations = [];
        var treatmentDrugs = [];
        var opdEncounter = visit.encounters.filter(function (encounter) {
            return encounter.encounterType.uuid === encounterConfig.getOpdConsultationEncounterUuid();
        })[0];

        if (opdEncounter) {
            var testOrders = opdEncounter.orders.filter(function (order) {
                return order.orderType && Bahmni.Opd.Constants.testOrderTypes.indexOf(order.orderType.display) >= 0;
            });
            investigations = testOrders.map(function (testOrder) {
                return { uuid: testOrder.uuid, conceptUuid: testOrder.concept.uuid, name: testOrder.concept.display,
                    isSet: testOrder.concept.set, orderTypeUuid: testOrder.orderType.uuid };
            });


            var drugOrders = opdEncounter.orders.filter(function (order) {
                return  order.orderType.display == Bahmni.Opd.Constants.drugOrderType;
            });

            treatmentDrugs = drugOrders.map(function (drugOrder) {
                return {

                    uuid: drugOrder.drug.uuid,
                    name: drugOrder.drug.display,
                    //   https://10.4.33.188/openmrs/ws/rest/v1/drug/fef3eaf8-2da5-432e-a19d-6db86f2a2fff?
                    strength: "test mg",
                    dosageForm: "test tablet",
                    prn: drugOrder.prn,
                    numberPerDosage: drugOrder.dose,
                    // store frequency and instruction uuid instead ?
                    dosageFrequency: drugOrder.frequency,
                    dosageInstruction: drugOrder.units,
                    numberOfDosageDays: calculateDosagedays(drugOrder.autoExpireDate, drugOrder.startDate),
                    notes: drugOrder.instructions,
                    conceptUuid: drugOrder.concept.uuid,
                    readonly: true
                }
            });
        }
        return {investigations: investigations,
                treatmentDrugs: treatmentDrugs};
    };

    var calculateDosagedays = function (endDate, startDate) {
        var differenceInTime = Math.abs(new Date(endDate) - new Date(startDate));
        var one_day = 1000 * 60 * 60 * 24;
        return Math.round(differenceInTime / one_day);
    }
};                                
