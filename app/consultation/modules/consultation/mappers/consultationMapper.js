Bahmni.Opd.ConsultationMapper = function (encounterConfig, dosageFrequencies, dosageInstructions) {
    this.map = function (visit) {
        var investigations = [];
        var treatmentDrugs = [];
        var diagnoses = [];

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

                drug.strength= formatStrength(drugOrder.drug.doseStrength, drugOrder.drug.units);
                drug.dosageForm= (drugOrder.drug.dosageForm)? drugOrder.drug.dosageForm.display : "" ;
                drug.prn= drugOrder.prn;
                drug.numberPerDosage= drugOrder.dose;
                drug.dosageFrequency= mapDosageUuid(drugOrder.frequency, dosageFrequencies);
                drug.dosageInstruction= mapDosageUuid(drugOrder.units, dosageInstructions);
                drug.numberOfDosageDays= calculateDosagedays(drugOrder.autoExpireDate, drugOrder.startDate);
                drug.notes= drugOrder.instructions;
                drug.conceptUuid= drugOrder.concept.uuid;
                drug.savedDrug= true;
                drug.empty=false;
                return drug;
            });
            var diagnosisObs = opdEncounter.obs.filter(function (observation) {
                return observation.concept.name.name === Bahmni.Opd.Constants.diagnosisObservationConceptName;
            });
            diagnoses = mapDiagnoses(diagnosisObs);
        }
        return {
            investigations: investigations,
            treatmentDrugs: treatmentDrugs,
            diagnoses:diagnoses
        };
    };

    var calculateDosagedays = function (endDate, startDate) {
        var differenceInTime = Math.abs(new Date(endDate) - new Date(startDate));
        var one_day = 1000 * 60 * 60 * 24;
        return Math.round(differenceInTime / one_day);
    };

    var formatStrength = function(strength, units){
        var correctStrength = (strength && strength != 0)? strength : "";
        var correctUnits = (units)? units : "";
        return correctStrength + " " + correctUnits;
    }

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

    var getDiagnosisConcept = function (codedDiagnosisObs, nonCodedDiagnosisObs) {
        if (codedDiagnosisObs) {
            return {
                conceptUuid:codedDiagnosisObs.value.uuid,
                conceptName:codedDiagnosisObs.value.name.name
            }
        }
        else if (nonCodedDiagnosisObs) {
            return {
                conceptUuid:nonCodedDiagnosisObs.value.uuid,
                conceptName:nonCodedDiagnosisObs.value.name.name
            }
        }
    }

    var mapDiagnoses = function (diagnosisObs) {
        var diagnoses = diagnosisObs.map(function (diagnosisOb) {
            var orderObs = diagnosisOb.groupMembers.filter(function (member) {
                return member.concept.name.name === Bahmni.Opd.Constants.orderConceptName;
            })[0];
            var certaintyObs = diagnosisOb.groupMembers.filter(function (member) {
                return member.concept.name.name === Bahmni.Opd.Constants.certaintyConceptName;
            })[0];
            var codedDiagnosisObs = diagnosisOb.groupMembers.filter(function (member) {
                return member.concept.name.name === Bahmni.Opd.Constants.codedDiagnosisConceptName;
            })[0];
            var nonCodedDiagnosisObs = diagnosisOb.groupMembers.filter(function (member) {
                return member.concept.name.name === Bahmni.Opd.Constants.nonCodedDiagnosisConceptName;
            })[0];
            return new Bahmni.Opd.Consultation.Diagnosis(getDiagnosisConcept(codedDiagnosisObs, nonCodedDiagnosisObs),
                orderObs.value.name.name, certaintyObs.value.name.name)
        })
        return diagnoses;
    }

};