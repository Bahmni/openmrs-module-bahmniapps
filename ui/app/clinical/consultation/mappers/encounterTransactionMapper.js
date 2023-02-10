'use strict';

Bahmni.Clinical.EncounterTransactionMapper = function () {
    var addEditedDiagnoses = function (consultation, diagnosisList) {
        if (consultation.pastDiagnoses) {
            consultation.pastDiagnoses.forEach(function (diagnosis) {
                if (diagnosis.isDirty) {
                    diagnosis.diagnosisDateTime = null;
                    diagnosisList.push(diagnosis);
                }
            });
        }
        if (consultation.savedDiagnosesFromCurrentEncounter) {
            consultation.savedDiagnosesFromCurrentEncounter.forEach(function (diagnosis) {
                if (diagnosis.isDirty) {
                    diagnosis.diagnosisDateTime = null;
                    diagnosisList.push(diagnosis);
                }
            });
        }
    };

    this.map = function (consultation, patient, locationUuid, retrospectiveEntry, defaultRetrospectiveVisitType, defaultVisitType, isInEditEncounterMode, patientProgramUuid) {
        var encounterData = {};
        encounterData.locationUuid = isInEditEncounterMode ? consultation.locationUuid : locationUuid;
        encounterData.patientUuid = patient.uuid;
        encounterData.encounterUuid = consultation.encounterUuid;
        encounterData.visitUuid = consultation.visitUuid;
        encounterData.providers = consultation.providers;
        encounterData.encounterDateTime = consultation.encounterDateTime;
        encounterData.extensions = {mdrtbSpecimen: consultation.newlyAddedSpecimens};
        encounterData.context = {patientProgramUuid: patientProgramUuid};

        if (!_.isEmpty(retrospectiveEntry)) {
            encounterData.visitType = defaultRetrospectiveVisitType || "OPD";
        } else if (!encounterData.visitUuid) {
            encounterData.visitType = defaultVisitType;
        } else if (!encounterData.visitType) {
            encounterData.visitType = defaultVisitType;
        }

        if (consultation.newlyAddedDiagnoses && consultation.newlyAddedDiagnoses.length > 0) {
            encounterData.bahmniDiagnoses = consultation.newlyAddedDiagnoses.map(function (diagnosis) {
                var conceptSystem = diagnosis.codedAnswer.conceptSystem ? diagnosis.codedAnswer.conceptSystem + "/" : "";
                return {
                    codedAnswer: { uuid: !diagnosis.isNonCodedAnswer ? conceptSystem + diagnosis.codedAnswer.uuid : undefined},
                    freeTextAnswer: diagnosis.isNonCodedAnswer ? diagnosis.codedAnswer.name : undefined,
                    order: diagnosis.order,
                    certainty: diagnosis.certainty,
                    existingObs: null,
                    diagnosisDateTime: null,
                    diagnosisStatusConcept: diagnosis.diagnosisStatusConcept,
                    voided: diagnosis.voided,
                    comments: diagnosis.comments
                };
            });
        } else {
            encounterData.bahmniDiagnoses = [];
        }
        addEditedDiagnoses(consultation, encounterData.bahmniDiagnoses);
        encounterData.orders = [];
        var addOrdersToEncounter = function () {
            var modifiedOrders = _.filter(consultation.orders, function (order) {
                return order.hasBeenModified || order.isDiscontinued || !order.uuid;
            });
            var tempOrders = modifiedOrders.map(function (order) {
                order.urgency = order.isUrgent ? "STAT" : undefined;

                if (order.hasBeenModified && !order.isDiscontinued) {
                    return Bahmni.Clinical.Order.revise(order);
                } else if (order.isDiscontinued) {
                    return Bahmni.Clinical.Order.discontinue(order);
                }
                return { uuid: order.uuid, concept: {name: order.concept.name, uuid: order.concept.uuid },
                    commentToFulfiller: order.commentToFulfiller, urgency: order.urgency};
            });
            encounterData.orders = encounterData.orders.concat(tempOrders);
        };
        addOrdersToEncounter();

        consultation.drugOrders = [];

        var newlyAddedTreatments = consultation.newlyAddedTreatments;
        if (newlyAddedTreatments) {
            newlyAddedTreatments.forEach(function (treatment) {
                consultation.drugOrders.push(Bahmni.Clinical.DrugOrder.createFromUIObject(treatment));
            });
        }
        if (consultation.removableDrugs) {
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
            if (!_.isEmpty(consultation.drugOrdersWithUpdatedOrderAttributes)) {
                var orderAttributes = _.values(consultation.drugOrdersWithUpdatedOrderAttributes).map(function (drugOrder) {
                    return drugOrder.getOrderAttributesAsObs();
                });
                encounterData.observations = encounterData.observations.concat(_.flatten(orderAttributes));
            }
        };

        addObservationsToEncounter();

        if (consultation.followUpConditions) {
            [].push.apply(consultation.observations, consultation.followUpConditions);
        }

        return encounterData;
    };
};
