'use strict';

angular.module('bahmni.common.displaycontrol.diagnosis')
    .directive('bahmniDiagnosis', ['diagnosisService', '$q', 'spinner', '$rootScope',
        function (diagnosisService, $q, spinner, $rootScope) {

            var controller = function ($scope) {
                var getAllDiagnosis = function () {
                    return diagnosisService.getPastDiagnoses($scope.patientUuid, $scope.visitUuid).success(function (response) {
                        var diagnosisMapper = new Bahmni.DiagnosisMapper();
                        $scope.allDiagnoses = diagnosisMapper.mapDiagnoses(response);
                        var found = _.find($scope.allDiagnoses, function (diagnoses) {
                            return diagnoses.diagnosisStatus !== $rootScope.diagnosisStatuses[0];
                        });

                    });
                };
                $scope.title = $scope.config.title;
                $scope.toggle = function (diagnosis, toggleLatest) {
                    if (toggleLatest) {
                        diagnosis.showDetails = false;
                        diagnosis.showLatestDetails = !diagnosis.showLatestDetails;
                    } else {
                        diagnosis.showLatestDetails = false;
                        diagnosis.showDetails = !diagnosis.showDetails;
                    }
                };

                var getPromises = function () {
                    return [getAllDiagnosis()];
                };

                $scope.isLatestDiagnosis = function (diagnosis) {
                    return diagnosis.latestDiagnosis ? diagnosis.existingObs == diagnosis.latestDiagnosis.existingObs : false;
                };

                spinner.forPromise($q.all(getPromises()));
            };
            return {
                restrict: 'E',
                controller: controller,
                templateUrl: "../common/displaycontrols/diagnosis/views/diagnosisDisplayControl.html",
                scope: {
                    patientUuid: "=",
                    config: "=",
                    visitUuid: "=",
                    showLatestDiagnosis: "@showLatestDiagnosis"
                }
            }
        }]);
