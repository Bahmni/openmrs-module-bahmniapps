'use strict';

angular.module('bahmni.clinical')
    .directive('bahmniDiagnosis', ['diagnosisService', '$q', 'spinner',
        function (diagnosisService, $q, spinner) {

            var controller = function ($scope) {
                var getAllDiagnosis = function () {
                    return diagnosisService.getPastDiagnoses($scope.patientUuid).success(function (response) {
                        var diagnosisMapper = new Bahmni.DiagnosisMapper();
                        $scope.allDiagnoses = diagnosisMapper.mapDiagnoses(response);
                        $scope.hasDiagnoses = _.isEmpty($scope.allDiagnoses) ? true : false;
                    });
                };

                $scope.toggle = function (item) {
                    item.show = !item.show
                };
                $scope.providerName = function (diagnosis) {
                    return diagnosis.providers[0] ? diagnosis.providers[0].name : "";
                }

                var getPromises = function () {
                    return [getAllDiagnosis()];
                };

                spinner.forPromise($q.all(getPromises()));
            }
            return {
                restrict: 'E',
                controller: controller,
                templateUrl: "displaycontrols/diagnosis/views/diagnosisDisplayControl.html",
                scope: {
                    patientUuid: "=",
                    config: "=",
                    title: "="
                }
            }
        }]);
