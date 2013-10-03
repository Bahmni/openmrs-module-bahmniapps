Bahmni.Opd.ConsultationMapper = function (encounterConfig, dosageFrequencies, dosageInstructions) {
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
                var drug = new Bahmni.Opd.Consultation.TreatmentDrug();
                drug.uuid = drugOrder.drug.uuid;
                drug.name= drugOrder.drug.display;
                //https=//10.4.33.188/openmrs/ws/rest/v1/drug/fef3eaf8-2da5-432e-a19d-6db86f2a2fff?
                drug.strength= "test mg";
                drug.dosageForm= "test tablet";
                drug.prn= drugOrder.prn;
                drug.numberPerDosage= drugOrder.dose;
                drug.dosageFrequency= mapDosageUuid(drugOrder.frequency, dosageFrequencies);
                drug.dosageInstruction= mapDosageUuid(drugOrder.units, dosageInstructions);
                drug.numberOfDosageDays= calculateDosagedays(drugOrder.autoExpireDate, drugOrder.startDate);
                drug.notes= drugOrder.instructions;
                drug.conceptUuid= drugOrder.concept.uuid;
                drug.readonly= true;
                drug.empty=false;
                return drug;
            });
        }
        return {investigations: investigations,
                treatmentDrugs: treatmentDrugs};
    };

    var calculateDosagedays = function (endDate, startDate) {
        var differenceInTime = Math.abs(new Date(endDate) - new Date(startDate));
        var one_day = 1000 * 60 * 60 * 24;
        return Math.round(differenceInTime / one_day);
    };

    var mapDosageUuid = function (dosageUuid, dosageConfigs) {
        if (dosageUuid && (dosageConfigs.results.length > 0)) {
            var answers = dosageConfigs.results[0].answers;
            var matchedAnswers = answers.filter(function (answer) {
                return answer.uuid == dosageUuid;
            });
            return matchedAnswers.length>0? matchedAnswers[0] : "";
        }
        return "";
    }
};                                
