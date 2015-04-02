'use strict';

angular.module('bahmni.common.displaycontrol.diagnosis')
    .directive('bahmniDiagnosis', ['diagnosisService', '$q', 'spinner',
        function (diagnosisService, $q, spinner) {

            var controller = function ($scope) {
                var getAllDiagnosis = function () {
                    return diagnosisService.getPastDiagnoses($scope.patientUuid, $scope.visitUuid).success(function (response) {
                        var diagnosisMapper = new Bahmni.DiagnosisMapper();

                        $scope.allDiagnoses = diagnosisMapper.mapDiagnoses(response);
                        var found = _.find($scope.allDiagnoses, function(diagnoses){
                            return diagnoses.diagnosisStatus !== "RULED OUT"
                        });
                        
                    });
                };
                $scope.title = $scope.config.title;
                $scope.toggle = function(diagnosis, toggleLatest) {
                    if(toggleLatest){
                        diagnosis.showDetails = false;
                        diagnosis.showLatestDetails = !diagnosis.showLatestDetails;
                    } else {
                        diagnosis.showLatestDetails = false;
                        diagnosis.showDetails = !diagnosis.showDetails;
                    }
                };
                $scope.providerName = function (diagnosis) {
                    return diagnosis.providers[0] ? diagnosis.providers[0].name : "";
                };

                var getPromises = function () {
                    return [getAllDiagnosis()];
                };

                spinner.forPromise($q.all(getPromises()));
            }
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
