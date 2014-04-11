'use strict';

angular.module('bahmni.clinical')
    .controller('ConsultationController', ['$scope', '$rootScope', 'encounterService', '$location', 'spinner', function ($scope, $rootScope, encounterService, $location, spinner) {

        var addEditedDiagnoses = function (diagnosisList) {
            $rootScope.consultation.pastDiagnoses && $rootScope.consultation.pastDiagnoses.forEach(function (diagnosis) {
                if (diagnosis.isDirty) {
                    diagnosis.previousObs = diagnosis.existingObs;
                    diagnosis.existingObs = '';
                    diagnosis.setDiagnosisStatusConcept();
                    diagnosis.diagnosisDateTime = undefined;
                    diagnosisList.push(diagnosis);
                }
            });
            $rootScope.consultation.savedDiagnosesFromCurrentEncounter && $rootScope.consultation.savedDiagnosesFromCurrentEncounter.forEach(function (diagnosis) {
                if (diagnosis.isDirty) {
                    diagnosis.setDiagnosisStatusConcept();
                    diagnosis.diagnosisDateTime = undefined;
                    diagnosisList.push(diagnosis);
                }
            });
        };

        var geEditedDiagnosesFromPastEncounters = function () {
            var editedDiagnosesFromPastEncounters = [];
            $rootScope.consultation.pastDiagnoses.forEach(function (pastDiagnosis) {
                if (pastDiagnosis.isDirty && pastDiagnosis.encounterUuid !== $rootScope.consultation.encounterUuid) {
                    editedDiagnosesFromPastEncounters.push(pastDiagnosis);
                }
            });
            return editedDiagnosesFromPastEncounters;
        };
        $scope.editedDiagnosesFromPastEncounters = geEditedDiagnosesFromPastEncounters();

        $scope.save = function () {
            var encounterData = {};
            encounterData.patientUuid = $scope.patient.uuid;
            encounterData.encounterTypeUuid = $rootScope.encounterConfig.getOpdConsultationEncounterTypeUuid();
            encounterData.encounterDateTime = $rootScope.consultation.encounterDateTime || new Date();

            if ($rootScope.consultation.newlyAddedDiagnoses && $rootScope.consultation.newlyAddedDiagnoses.length > 0) {
                encounterData.bahmniDiagnoses = $rootScope.consultation.newlyAddedDiagnoses.map(function (diagnosis) {
                    return {
                        codedAnswer: { uuid: !diagnosis.isNonCodedAnswer ? diagnosis.codedAnswer.uuid : undefined},
                        freeTextAnswer: diagnosis.isNonCodedAnswer ? diagnosis.codedAnswer.name : undefined,
                        order: diagnosis.order,
                        certainty: diagnosis.certainty,
                        existingObs: null,
                        diagnosisDateTime: null,
                        diagnosisStatusConcept: diagnosis.getDiagnosisStatusConcept(),
                        voided: diagnosis.voided
                    }
                });
            } else {
                encounterData.bahmniDiagnoses = [];
            }
            addEditedDiagnoses(encounterData.bahmniDiagnoses);

            encounterData.testOrders = $rootScope.consultation.investigations.map(function (investigation) {
                return { uuid: investigation.uuid, concept: {uuid: investigation.concept.uuid }, orderTypeUuid: investigation.orderTypeUuid, voided: investigation.voided || false};
            });

            var startDate = new Date();
            var allTreatmentDrugs = $rootScope.consultation.treatmentDrugs || [];
            var newlyAddedTreatmentDrugs = allTreatmentDrugs.filter(function (drug) {
                return !drug.savedDrug;
            });

            if (newlyAddedTreatmentDrugs) {
                encounterData.drugOrders = newlyAddedTreatmentDrugs.map(function (drug) {
                    return drug.requestFormat(startDate);
                });
            }

            encounterData.disposition = $rootScope.disposition;

            var addObservationsToEncounter = function () {
                encounterData.observations = encounterData.observations || [];

                if ($scope.consultation.consultationNote.value) {
                    encounterData.observations.push($scope.consultation.consultationNote);
                }
                if ($scope.consultation.labOrderNote.value) {
                    encounterData.observations.push($scope.consultation.labOrderNote);
                }
                encounterData.observations = encounterData.observations.concat($rootScope.consultation.observations);
            };

            $rootScope.consultation.observations = new Bahmni.Common.Domain.ObservationFilter().filter($rootScope.consultation.observations);
            addObservationsToEncounter();

            spinner.forPromise(encounterService.create(encounterData).success(function () {
                $location.path(Bahmni.Clinical.Constants.patientsListUrl);
            }));
        };

        $scope.onNoteChanged = function () {
            $scope.consultation.consultationNote.observationDateTime = new Date();
        };

    }]);

