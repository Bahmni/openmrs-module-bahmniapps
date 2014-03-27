'use strict';

angular.module('bahmni.clinical')
    .controller('ConsultationController', ['$scope', '$rootScope', 'encounterService', '$location', 'spinner', function ($scope, $rootScope, encounterService, $location, spinner) {

        var addEditedPastDiagnoses = function (diagnosisList, additionalCheck) {
            $rootScope.consultation.pastDiagnoses && $rootScope.consultation.pastDiagnoses.forEach(function (diagnosis) {
                if (diagnosis.isDirty && additionalCheck(diagnosis)) {
                    var editedPastDiagnosis = angular.extend(new Bahmni.Clinical.Diagnosis(diagnosis.codedAnswer), diagnosis);
                    editedPastDiagnosis.existingObs = '';
                    diagnosisList.push(editedPastDiagnosis);
                }
            });
        }

        var getRuledOutDiagnosesObservations = function () {
            var ruledOutDiagnosisObservations = [];
            if (!$rootScope.consultation.pastDiagnoses) return [];
            $rootScope.consultation.pastDiagnoses.forEach(function (diagnosis) {
                if (diagnosis.isDirty && diagnosis.certainty == Bahmni.Common.Constants.ruledOutCertainty) {
                    //TODO: Sushmita/Mujir - remove hardcoded concept, add liquibase migration. also remove 'ruled out' hard coding.
                    var ruledOutDiagnosisConceptUuid = $rootScope.ruledOutDiagnosisConcept.uuid;
                    ruledOutDiagnosisObservations.push({ value: diagnosis.codedAnswer.uuid, concept: {uuid: ruledOutDiagnosisConceptUuid}});
                }
            });
            return ruledOutDiagnosisObservations;
        };


        var init = function () {
            $scope.nonVoidedDiagnoses = $rootScope.consultation.diagnoses.filter(function (diagnosis) {
                return diagnosis.voided != true;
            });
            addEditedPastDiagnoses($scope.nonVoidedDiagnoses, function(){return true;});

        }

        $scope.save = function () {

            var encounterData = {};
            encounterData.patientUuid = $scope.patient.uuid;
            encounterData.encounterTypeUuid = $rootScope.encounterConfig.getOpdConsultationEncounterTypeUuid();
            encounterData.encounterDateTime = $rootScope.consultation.encounterDateTime || new Date();

            addEditedPastDiagnoses($rootScope.consultation.diagnoses, function(diagnosis){diagnosis.certainty != Bahmni.Common.Constants.ruledOutCertainty});
            if ($rootScope.consultation.diagnoses && $rootScope.consultation.diagnoses.length > 0) {
                encounterData.diagnoses = $rootScope.consultation.diagnoses.map(function (diagnosis) {
                    return {
                        codedAnswer: { uuid: diagnosis.codedAnswer.uuid },
                        order: diagnosis.order,
                        certainty: diagnosis.certainty,
                        existingObs: diagnosis.existingObs,
                        diagnosisDateTime: diagnosis.diagnosisDateTime,
                        voided: diagnosis.voided
                    }
                });
            }

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

                var ruledOutDiagnosesObservations = getRuledOutDiagnosesObservations();
                if (ruledOutDiagnosesObservations) {
                    ruledOutDiagnosesObservations.forEach(function (diagnosis) {
                        encounterData.observations.push(diagnosis);
                    });
                }

                if ($scope.consultation.consultationNote.value) {
                    encounterData.observations.push($scope.consultation.consultationNote);
                }
                if ($scope.consultation.labOrderNote.value) {
                    encounterData.observations.push($scope.consultation.labOrderNote);
                }
                encounterData.observations = encounterData.observations.concat($rootScope.consultation.observations);
            };

            var observationFilter = new Bahmni.ObservationFilter();
            $rootScope.consultation.observations.forEach(function (observation) {
                observationFilter.voidIfNull(observation);
            });

            addObservationsToEncounter();

            spinner.forPromise(encounterService.create(encounterData).success(function () {
                $location.path(Bahmni.Clinical.Constants.patientsListUrl);
            }));
        };

        $scope.onNoteChanged = function () {
            $scope.consultation.consultationNote.observationDateTime = new Date();
        }

        init();
    }
    ])
;

