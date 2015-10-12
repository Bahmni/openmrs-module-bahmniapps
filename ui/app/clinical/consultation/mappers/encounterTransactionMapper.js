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

    this.map = function (consultation, patient, locationUuid, retrospectiveEntry, defaultRetrospectiveVisitType, defaultVisitType, hasActiveVisit, isInEditEncounterMode) {
        var encounterData = {};
        encounterData.locationUuid = isInEditEncounterMode? consultation.locationUuid : locationUuid;
        encounterData.patientUuid = patient.uuid;
        encounterData.encounterUuid = consultation.encounterUuid;
        encounterData.visitUuid = consultation.visitUuid;
        encounterData.providers = consultation.providers;
        encounterData.encounterDateTime = consultation.encounterDateTime;
        encounterData.extension = consultation.extension;

        if (!_.isEmpty(retrospectiveEntry)) {
            encounterData.visitType = defaultRetrospectiveVisitType || "OPD";
        }else if(!hasActiveVisit){
            encounterData.visitType = defaultVisitType;
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
        encounterData.orders = [];
        
        var addOrdersToEncounter = function () {
            var modifiedOrders = _.filter(consultation.orders, function(order){
                return order.hasBeenModified || order.isDiscontinued || !order.uuid
            });
            var tempOrders = modifiedOrders.map(function (order) {
                if(order.hasBeenModified && !order.isDiscontinued){
                    return Bahmni.Clinical.Order.revise(order);
                }
                else if(order.isDiscontinued){
                    return Bahmni.Clinical.Order.discontinue(order);
                }
                return { uuid: order.uuid, concept: {name: order.concept.name, uuid: order.concept.uuid },
                    commentToFulfiller: order.commentToFulfiller};
            });
            encounterData.orders = encounterData.orders.concat(tempOrders);
        };
        addOrdersToEncounter();

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