'use strict';

angular.module('bahmni.common.displaycontrol.diagnosis')
    .directive('bahmniDiagnosis', ['diagnosisService', '$q', 'spinner', '$rootScope', '$filter', '$translate', 'providerInfoService',
        function (diagnosisService, $q, spinner, $rootScope, $filter, $translate, providerInfoService) {
            var controller = function ($scope) {
                var getAllDiagnosis = function () {
                    return diagnosisService.getDiagnoses($scope.patientUuid, $scope.visitUuid).then(function (response) {
                        var diagnosisMapper = new Bahmni.DiagnosisMapper($rootScope.diagnosisStatus);
                        $scope.allDiagnoses = diagnosisMapper.mapDiagnoses(response.data);
                        if ($scope.showRuledOutDiagnoses == false) {
                            $scope.allDiagnoses = _.filter($scope.allDiagnoses, function (diagnoses) {
                                return diagnoses.diagnosisStatus !== $rootScope.diagnosisStatus;
                            });
                        }
                        providerInfoService.setProvider($scope.allDiagnoses);
                        $scope.isDataPresent = function () {
                            if ($scope.allDiagnoses && $scope.allDiagnoses.length == 0) {
                                $scope.$emit("no-data-present-event");
                                return false;
                            }
                            return true;
                        };
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

                $scope.translateDiagnosisLabels = function (key, type) {
                    if (key) {
                        var translationKey = "CLINICAL_DIAGNOSIS_" + type + "_" + key.toUpperCase();
                        var translation = $translate.instant(translationKey);
                        if (translation != translationKey) {
                            return translation;
                        }
                    }
                    return key;
                };

                $scope.initialization = $q.all(getPromises());
            };

            var link = function ($scope, element) {
                spinner.forPromise($scope.initialization, element);
            };

            return {
                restrict: 'E',
                controller: controller,
                link: link,
                templateUrl: function (element, attrs) {
                    if (attrs.templateUrl) {
                        return attrs.templateUrl;
                    } else {
                        return "../common/displaycontrols/diagnosis/views/diagnosisDisplayControl.html";
                    }
                },
                scope: {
                    patientUuid: "=",
                    config: "=",
                    visitUuid: "=?",
                    showRuledOutDiagnoses: "=?",
                    hideTitle: "=?",
                    showLatestDiagnosis: "@showLatestDiagnosis"
                }
            };
        }]);
