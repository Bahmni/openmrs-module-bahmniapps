'use strict';

angular.module('bahmni.common.displaycontrol.observation')
    .directive('bahmniObservation', ['observationsService', 'appService', '$q', 'spinner', '$stateParams',
        function (observationsService, appService, $q, spinner, $stateParams) {

            var controller = function ($scope) {
                $scope.showGroupDateTime = $scope.config.showGroupDateTime === false ? false : true;

                var mapObservation = function (observations, config) {

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
                    //$scope.removeObsWithNoOrderId = angular.isDefined($scope.removeObsWithNoOrderId) ? $scope.filterObsWithOrders : false;
                    var programConfig = appService.getAppDescriptor().getConfigValue("program") || {};
                    if ($scope.observations) {
                        mapObservation($scope.observations, $scope.config);
                        $scope.isFulfilmentDisplayControl = true;
                    }
                    else {
                        var startDate = null, endDate = null;
                        if (programConfig.showDetailsWithinDateRange) {
                            startDate = $stateParams.dateEnrolled;
                            endDate = $stateParams.dateCompleted;
                        }
                        if ($scope.config.encounterUuid) {
                            spinner.forPromise(observationsService.fetchForEncounter($scope.config.encounterUuid, $scope.config.conceptNames)).then(function (response) {
                                mapObservation(response.data, $scope.config)
                            });
                        } else {
                            spinner.forPromise(observationsService.fetch($scope.patient.uuid, $scope.config.conceptNames,
                                $scope.config.scope, $scope.config.numberOfVisits, $scope.visitUuid, $scope.config.obsIgnoreList, null, startDate, endDate)).then(function (response) {
                                mapObservation(response.data, $scope.config);
                            });
                        }
                    }
                };

                $scope.toggle = function (element) {
                    element.isOpen = !element.isOpen;
                };

                $scope.isClickable = function () {
                    return $scope.isOnDashboard && $scope.section.allObservationDetails &&
                        ($scope.section.allObservationDetails.pivotTable || $scope.section.allObservationDetails.observationGraph);
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
                    message: "="
                }
            }
        }]);
