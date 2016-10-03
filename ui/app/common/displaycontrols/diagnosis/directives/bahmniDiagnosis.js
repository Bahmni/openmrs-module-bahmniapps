'use strict';

angular.module('bahmni.common.displaycontrol.diagnosis')
    .directive('bahmniDiagnosis', ['diagnosisService', '$q', 'spinner', '$rootScope',
        function (diagnosisService, $q, spinner, $rootScope) {
            var controller = function ($scope) {
                var getAllDiagnosis = function () {
                    return diagnosisService.getDiagnoses($scope.patientUuid, $scope.visitUuid).then(function (diagnoses) {
                        $scope.allDiagnoses = diagnoses;
                        if($scope.showDiagnosisWithState && $scope.showDiagnosisWithState.length > 0){
                            $scope.allDiagnoses = filteredDiagnosis($scope.allDiagnoses, $scope.showDiagnosisWithState);
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

                var filteredDiagnosis = function (allDiagnoses, filterCriterias) {
                    return _.filter(allDiagnoses, function (diagnosis) {
                        return _.find(filterCriterias, function (filterCriteria) {
                            return filterCriteria == 'active' && diagnosis.diagnosisStatus == null ||
                            _.has(diagnosis.diagnosisStatus, filterCriteria) ? true : false;
                        })
                    })
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
                    showCuredDiagnoses :"=?",
                    showDiagnosisWithState:"=?",
                    hideTitle: "=?",
                    showLatestDiagnosis: "@showLatestDiagnosis"
                }
            }
        }]);
