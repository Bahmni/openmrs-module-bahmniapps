'use strict';

angular.module('bahmni.common.displaycontrol.observation')
    .directive('bahmniObservation', ['observationsService', 'appService', '$q', 'spinner', '$rootScope',
        function (observationsService, appService, $q, spinner, $rootScope) {

            var controller = function ($scope) {
                $scope.print = $rootScope.isBeingPrinted || false;

                $scope.showGroupDateTime = $scope.config.showGroupDateTime !== false;

                var mapObservation = function (observations) {

                    var conceptsConfig = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
                    observations = new Bahmni.Common.Obs.ObservationMapper().map(observations, conceptsConfig);

                    $scope.bahmniObservations = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().groupByEncounterDate(observations);
                    if (_.isEmpty($scope.bahmniObservations)) {
                        $scope.noObsMessage = Bahmni.Common.Constants.messageForNoObservation;
                    }
                    else {
                        if (!$scope.showGroupDateTime) {
                            _.forEach($scope.bahmniObservations, function (bahmniObs) {
                                bahmniObs.isOpen = true;
                            });
                        }
                        else {
                            $scope.bahmniObservations[0].isOpen = true;
                        }
                    }
                };

                var fetchObservations = function () {
                    if ($scope.observations) {
                        mapObservation($scope.observations, $scope.config);
                        $scope.isFulfilmentDisplayControl = true;
                    }
                    else {
                        if ($scope.config.observationUuid){
                            spinner.forPromise(observationsService.getByUuid($scope.config.observationUuid)).then(function(response){
                                mapObservation([response.data], $scope.config)
                            })
                        } else if ($scope.config.encounterUuid) {
                            spinner.forPromise(observationsService.fetchForEncounter($scope.config.encounterUuid, $scope.config.conceptNames)).then(function (response) {
                                mapObservation(response.data, $scope.config)
                            });
                        } else if ($scope.enrollment) {
                            spinner.forPromise(observationsService.fetchForPatientProgram($scope.enrollment, $scope.config.conceptNames, $scope.config.scope)).then(function (response) {
                                mapObservation(response.data, $scope.config)
                            });
                        }else {
                            spinner.forPromise(observationsService.fetch($scope.patient.uuid, $scope.config.conceptNames,
                                $scope.config.scope, $scope.config.numberOfVisits, $scope.visitUuid,
                                $scope.config.obsIgnoreList, null)).then(function (response) {
                                mapObservation(response.data, $scope.config);
                            });
                        }
                    }
                };

                $scope.toggle = function (element) {
                    element.isOpen = !element.isOpen;
                };

                $scope.isClickable = function () {
                    return $scope.isOnDashboard && $scope.section.expandedViewConfig &&
                        ($scope.section.expandedViewConfig.pivotTable || $scope.section.expandedViewConfig.observationGraph);
                };

                fetchObservations();

                $scope.dialogData = {
                    "patient": $scope.patient,
                    "section": $scope.section
                };


            };
            return {
                restrict: 'E',
                controller: controller,
                templateUrl: "../common/displaycontrols/observation/views/observationDisplayControl.html",
                scope: {
                    patient: "=",
                    visitUuid: "@",
                    section: "=",
                    config: "=",
                    title: "=sectionTitle",
                    isOnDashboard: "=",
                    observations: "=",
                    message: "=",
                    enrollment: "="
                }
            }
        }]);
