'use strict';

angular.module('bahmni.common.displaycontrol.diagnosis')
    .directive('bahmniDiagnosis', ['diagnosisService', '$q', 'spinner', '$rootScope',
        function (diagnosisService, $q, spinner, $rootScope) {
            var controller = function ($scope) {
                var getAllDiagnosis = function () {
                    return diagnosisService.getDiagnoses($scope.patientUuid, $scope.visitUuid).then(function (diagnoses) {
                        $scope.allDiagnoses = diagnoses;
                        if ($scope.showRuledOutDiagnoses == false) {
                            $scope.allDiagnoses = diagnosisService.removeRuledOut($scope.allDiagnoses);
                        }
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
                    visitUuid: "=?",
                    showRuledOutDiagnoses: "=?",
                    hideTitle: "=?",
                    showLatestDiagnosis: "@showLatestDiagnosis"
                }
            }
        }]);
