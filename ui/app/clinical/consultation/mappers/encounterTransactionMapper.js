'use strict';

Bahmni.Clinical.EncounterTransactionMapper = function () {

    var addEditedDiagnoses = function (consultation, diagnosisList) {
        consultation.pastDiagnoses && consultation.pastDiagnoses.forEach(function (diagnosis) {
            if (diagnosis.isDirty) {
                diagnosis.diagnosisDateTime = null;
                diagnosisList.push(diagnosis);
            }
        });
        consultation.savedDiagnosesFromCurrentEncounter && consultation.savedDiagnosesFromCurrentEncounter.forEach(function (diagnosis) {
            if (diagnosis.isDirty) {
                diagnosis.diagnosisDateTime = null;
                diagnosisList.push(diagnosis);
            }
        });
    };

    this.map = function (consultation, patient, locationUuid, retrospectiveEntry) {
        var encounterData = {};
        encounterData.locationUuid = locationUuid;
        encounterData.patientUuid = patient.uuid;

        if (retrospectiveEntry.isRetrospective) {
            encounterData.encounterDateTime = Bahmni.Common.Util.DateUtil.getDateWithoutHours(retrospectiveEntry.encounterDate);
            encounterData.visitType = "OPD";
        }

        if (consultation.newlyAddedDiagnoses && consultation.newlyAddedDiagnoses.length > 0) {
            encounterData.bahmniDiagnoses = consultation.newlyAddedDiagnoses.map(function (diagnosis) {
                return {
                    codedAnswer: { uuid: !diagnosis.isNonCodedAnswer ? diagnosis.codedAnswer.uuid : undefined},
                    freeTextAnswer: diagnosis.isNonCodedAnswer ? diagnosis.codedAnswer.name : undefined,
                    order: diagnosis.order,
                    certainty: diagnosis.certainty,
                    existingObs: null,
                    diagnosisDateTime: null,
                    diagnosisStatusConcept: diagnosis.diagnosisStatusConcept,
                    voided: diagnosis.voided,
                    comments: diagnosis.comments
                }
            });
        } else {
            encounterData.bahmniDiagnoses = [];
        }
        addEditedDiagnoses(consultation, encounterData.bahmniDiagnoses);
        encounterData.testOrders = [];
        
        var addTestOrdersToEncounter = function () {
            var tempOrders = consultation.testOrders.map(function (order) {
                if(order.hasBeenModified){
                    return Bahmni.Clinical.Order.revise(order);
                }
                return { uuid: order.uuid, concept: {name: order.concept.name, uuid: order.concept.uuid }, voided: order.voided || false,
                    commentToFulfiller: order.commentToFulfiller};
            });
            encounterData.testOrders = encounterData.testOrders.concat(tempOrders);
        };
        addTestOrdersToEncounter();

        consultation.drugOrders = [];
        var newlyAddedTreatments = consultation.newlyAddedTreatments;
        newlyAddedTreatments && newlyAddedTreatments.forEach(function (treatment) {
            consultation.drugOrders.push(Bahmni.Clinical.DrugOrder.createFromUIObject(treatment));
        });
        if(consultation.removableDrugs) {
            consultation.drugOrders = consultation.drugOrders.concat(consultation.removableDrugs);
        }

        encounterData.drugOrders = consultation.drugOrders;

        encounterData.disposition = consultation.disposition;

        var addObservationsToEncounter = function () {
            encounterData.observations = consultation.observations || [];

            if (consultation.consultationNote) {
                encounterData.observations.push(consultation.consultationNote);
            }
            if (consultation.labOrderNote) {
                encounterData.observations.push(consultation.labOrderNote);
            }
            if(!_.isEmpty(consultation.drugOrdersWithUpdatedOrderAttributes)){
                var orderAttributes = _.values(consultation.drugOrdersWithUpdatedOrderAttributes).map(function(drugOrder){
                    return drugOrder.getOrderAttributesAsObs();
                });
                encounterData.observations = encounterData.observations.concat(_.flatten(orderAttributes,true));
            }
        };

        addObservationsToEncounter();

        return encounterData;
    };
};