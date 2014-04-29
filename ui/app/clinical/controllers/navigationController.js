'use strict';

angular.module('bahmni.clinical').controller('ConsultationNavigationController',
    ['$scope', '$rootScope', '$location', '$window', 'appService', 'urlHelper', 'contextChangeHandler', 'spinner', 'encounterService', 'RegisterTabService',
        function ($scope, $rootScope, $location, $window, appService, urlHelper, contextChangeHandler, spinner, encounterService, registerTabService) {
            //$scope.mainButtonText = "Consultation";
            
            var boardTypes = {
                visit: 'visit',
                consultation: 'consultation'
            };
            $scope.availableBoards = [
                { name: 'Visit', url: '', type: boardTypes.visit}
            ];
            $scope.currentBoard = $scope.availableBoards[0];
            $scope.showBoard = function (name) {
                var board = findBoardByname(name);
                return buttonClickAction(board);
            };

            $scope.gotoPatientDashboard = function() {
                $location.path("/patient/" + $rootScope.patient.uuid + "/dashboard");
            };

            var setCurrentBoardBasedOnPath = function() {
                var currentPath = $location.path();
                var board = findBoardByUrl(currentPath);
                $scope.currentBoard = board || $scope.availableBoards[0];
            };

            var stringContains = function (sourceString, pattern) {
                return (sourceString.search(pattern) >= 0);
            };

            var initialize = function () {
                $rootScope.$on('event:appExtensions-loaded', function () {
                    var appExtensions = appService.getAppDescriptor().getExtensions("org.bahmni.clinical.consultation.board", "link");
                    var addlBoards = [];
                    appExtensions.forEach(function (appExtn) {
                        addlBoards.push({ name: appExtn.label, url: appExtn.url, type: boardTypes.consultation });
                    });
                    $scope.availableBoards = $scope.availableBoards.concat(addlBoards);
                    setCurrentBoardBasedOnPath();
                });
            };

            $scope.$on('$stateChangeStart', function() { 
                setCurrentBoardBasedOnPath();
            });

            var findBoardByname = function (name) {
                var boards = $scope.availableBoards.filter(function (board) {
                    return board.name === name;
                });
                return boards.length > 0 ? boards[0] : null;
            };

            var findBoardByUrl = function (url) {
                var boards = $scope.availableBoards.filter(function (board) {
                    return stringContains(url, board.url);
                });
                return boards.length > 0 ? boards[1] : null;
            };

            var getUrl = function (board) {
                var urlPrefix = board.type === boardTypes.visit ? urlHelper.getVisitUrl($rootScope.consultation.visitUuid) : urlHelper.getPatientUrl();
                var url = board.url ? urlPrefix + "/" + board.url : urlPrefix ; 
                return $location.url(url);                    
            };


            var buttonClickAction = function (board) {
                if ($scope.currentBoard === board) return;
                if (!contextChangeHandler.execute()) return;
                contextChangeHandler.reset();
                $scope.currentBoard = board;
                return getUrl(board);
            };




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

            $scope.save = function () {
                registerTabService.fire();
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
                    $rootScope.success_message = "Consultation information saved";
                }).error(function(){
                    $rootScope.server_error = "Failed to save consultation information";
                }));
            };


            initialize();

        }]);
