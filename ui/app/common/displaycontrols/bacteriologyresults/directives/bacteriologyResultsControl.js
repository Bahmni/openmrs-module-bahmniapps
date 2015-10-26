'use strict';

angular.module('bahmni.common.displaycontrol.bacteriologyresults')
    .directive('bacteriologyResultsControl', ['bacteriologyResultsService', 'appService', '$q', 'spinner', '$filter', '$translate',
        function (bacteriologyResultsService, appService, $q, spinner, $filter) {
            var controller = function ($scope) {

                var init = function () {
                    $scope.title = "bacteriology results";
                    var params = {
                        patientUuid: $scope.patient.uuid,
                        scope: $scope.scope,
                        conceptNames: "BACTERIOLOGY CONCEPT SET"
                    };
                    return bacteriologyResultsService.getBacteriologyResults(params).then(function (response) {
                        handleResponse(response);
                    });
                };

                var handleResponse = function (response) {
                    var observations = response.data.results;
                    if (observations && observations.length > 0) {
                        $scope.specimens = [];

                        _.forEach(observations, function (observation) {
                            var specimen = {};
                            var report = observation.report;
                            var testResults;
                            if (report) {
                                testResults = report.results;
                                var conceptsConfig = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
                                var obs = new Bahmni.Common.Obs.ObservationMapper().map([testResults], conceptsConfig);
                                specimen.sampleResult = obs && obs.length > 0 ? obs[0] : obs;

                            }

                            specimen.specimenSource = observation.type.name;
                            specimen.specimenId = observation.identifier;
                            specimen.specimenCollectionDate = observation.dateCollected;

                            $scope.specimens.push(specimen);
                        });
                    }

                };

                $scope.hasResults = function (test){
                    return test && test.groupMembers;
                }

                spinner.forPromise(init());
            };
            return {
                restrict: 'E',
                controller: controller,
                templateUrl: "../common/displaycontrols/bacteriologyresults/views/bacteriologyResultsControl.html",
                scope: {
                    patient: "=",
                    section: "=",
                    observationUuid: "=",
                    config: "=",
                    isOnDashboard: "=",
                    visitUuid: "="
                }
            }
        }]);
