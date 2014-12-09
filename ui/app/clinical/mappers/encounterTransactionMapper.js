'use strict';

Bahmni.Clinical.EncounterTransactionMapper = function () {

    var addEditedDiagnoses = function (consultation, diagnosisList) {
        consultation.pastDiagnoses && consultation.pastDiagnoses.forEach(function (diagnosis) {
            if (diagnosis.isDirty) {
                diagnosis.setDiagnosisStatusConcept();
                diagnosis.diagnosisDateTime = null;
                diagnosisList.push(diagnosis);
            }
        });
        consultation.savedDiagnosesFromCurrentEncounter && consultation.savedDiagnosesFromCurrentEncounter.forEach(function (diagnosis) {
            if (diagnosis.isDirty) {
                // TODO : shruthi : can avoid this using javascript property
                diagnosis.setDiagnosisStatusConcept();
                diagnosis.diagnosisDateTime = null;
                diagnosisList.push(diagnosis);
            }
        });
    };

    this.map = function (consultation, patient, locationUuid) {
        consultation.saveHandler.fire();
        var encounterData = {};
        encounterData.locationUuid = locationUuid;
        encounterData.patientUuid = patient.uuid;
        encounterData.encounterDateTime = null;

        if (consultation.newlyAddedDiagnoses && consultation.newlyAddedDiagnoses.length > 0) {
            encounterData.bahmniDiagnoses = consultation.newlyAddedDiagnoses.map(function (diagnosis) {
                return {
                    codedAnswer: { uuid: !diagnosis.isNonCodedAnswer ? diagnosis.codedAnswer.uuid : undefined},
                    freeTextAnswer: diagnosis.isNonCodedAnswer ? diagnosis.codedAnswer.name : undefined,
                    order: diagnosis.order,
                    certainty: diagnosis.certainty,
                    existingObs: null,
                    diagnosisDateTime: null,
                    diagnosisStatusConcept: diagnosis.getDiagnosisStatusConcept(),
                    voided: diagnosis.voided,
                    comments: diagnosis.comments
                }
            });
        } else {
            encounterData.bahmniDiagnoses = [];
        }
        addEditedDiagnoses(consultation, encounterData.bahmniDiagnoses);

        encounterData.testOrders = consultation.investigations.map(function (investigation) {
            return { uuid: investigation.uuid, concept: {uuid: investigation.concept.uuid }, orderTypeUuid: investigation.orderTypeUuid, voided: investigation.voided || false};
        });

        encounterData.drugOrders = consultation.drugOrders;

        encounterData.disposition = consultation.disposition;

        var addObservationsToEncounter = function () {
            encounterData.observations = encounterData.observations || [];

            if (consultation.consultationNote) {
                encounterData.observations.push(consultation.consultationNote);
            }
            if (consultation.labOrderNote) {
                encounterData.observations.push(consultation.labOrderNote);
            }
            encounterData.observations = encounterData.observations.concat(consultation.observations);
        };

        addObservationsToEncounter();

        return encounterData;
    };
};