'use strict';

angular.module('bahmni.common.obs')
    .directive('showObservation', ['ngDialog', function (ngDialog) {
        var controller = function ($scope, $rootScope, $filter) {
            $scope.toggle = function (observation) {
                observation.showDetails = !observation.showDetails;
            };

            $scope.print = $rootScope.isBeingPrinted || false;

            $scope.dateString = function (observation) {
                var filterName;
                if ($scope.showDate && $scope.showTime) {
                    filterName = 'bahmniDateTime';
                } else if (!$scope.showDate && ($scope.showTime || $scope.showTime === undefined)) {
                    filterName = 'bahmniTime';
                } else {
                    return null;
                }
                return $filter(filterName)(observation.observationDateTime);
            };
            $scope.openVideoInPopup = function (observation) {
                ngDialog.open({
                    template: "../common/obs/views/showVideo.html",
                    closeByDocument: false,
                    className: 'ngdialog-theme-default',
                    showClose: true,
                    data: {
                        observation: observation
                    }
                });
            };
            $scope.recalculateBMIData = function () {
                if ($scope.observation.concept.name === "WEIGHT") {
                    $scope.patient.weight = $scope.observation.value;
                }

                if ($scope.observation.concept.name === "HEIGHT") {
                    $scope.patient.height = $scope.observation.value;
                }

                if ($scope.observation.concept.name === "BMI Data" && $scope.patient.age.years < 5) {
                    $scope.observation.value = "--";
                    $scope.observation.abnormal = false;
                }

                if ($scope.observation.concept.name === "BMI Status Data") {
                    $scope.observation.value = $scope.observation.value.toUpperCase();
                }

                if ($scope.observation.concept.name === "BMI Status Data" && $scope.patient.age.years < 5) {
                    var dataSource = " ";
                    var isValidHeight = false;
                    if ($scope.patient.gender === "M") {
                        dataSource = "twoToFiveMale";
                        if ($scope.patient.age.years < 2) {
                            dataSource = "zeroToTwoMale";
                        }
                    } else {
                        dataSource = "twoToFiveFemale";
                        if ($scope.patient.age.years < 2) {
                            dataSource = "zeroToTwoFemale";
                        }
                    }

                    for (var i = 0; i < childrensBMI[dataSource].length; i++) {
                        if ($scope.patient.height === childrensBMI[dataSource][i].height) {
                            isValidHeight = true;
                            var severeObese = parseFloat(childrensBMI[dataSource][i].severe_obese.replace(",", "."));

                            var obeseSplit = childrensBMI[dataSource][i].obese.split("-");
                            var obeseMin = parseFloat(obeseSplit[0].replace(",", "."));
                            var obeseMax = parseFloat(obeseSplit[1].replace(",", "."));

                            var normalSplit = childrensBMI[dataSource][i].normal.split("-");
                            var normalMin = parseFloat(normalSplit[0].replace(",", "."));
                            var normalMax = parseFloat(normalSplit[1].replace(",", "."));

                            var malnutritionSplit = childrensBMI[dataSource][i].malnutrition.split("-");
                            var malnutritionMin = parseFloat(malnutritionSplit[0].replace(",", "."));
                            var malnutritionMax = parseFloat(malnutritionSplit[1].replace(",", "."));

                            var severeMalnutrition = parseFloat(childrensBMI[dataSource][i].severe_malnutrition.replace(",", "."));

                            if ($scope.patient.weight > severeObese) {
                                $scope.observation.value = "OBESE";
                                $scope.observation.abnormal = true;
                            }
                            if ($scope.patient.weight >= obeseMin && $scope.patient.weight <= obeseMax) {
                                $scope.observation.value = "OVERWEIGHT";
                                $scope.observation.abnormal = true;
                            }
                            if ($scope.patient.weight >= normalMin && $scope.patient.weight <= normalMax) {
                                $scope.observation.value = "NORMAL";
                                $scope.observation.abnormal = false;
                                console.log("passou do normal");
                            }
                            if ($scope.patient.weight >= malnutritionMin && $scope.patient.weight <= malnutritionMax) {
                                $scope.observation.value = "SEVERELY UNDERWEIGHT";
                                $scope.observation.abnormal = true;
                            }
                            if ($scope.patient.weight < severeMalnutrition) {
                                $scope.observation.value = "VERY SEVERELY UNDERWEIGHT";
                                $scope.observation.abnormal = true;
                            }
                        }
                    }
                    if (!isValidHeight) {
                        $scope.observation.value = "--";
                    }
                }
            };

            $scope.recalculateBMIData();
        };
        return {
            restrict: 'E',
            scope: {
                observation: "=?",
                patient: "=",
                showDate: "=?",
                showTime: "=?",
                showDetailsButton: "=?"
            },
            controller: controller,
            template: '<ng-include src="\'../common/obs/views/showObservation.html\'" />'
        };
    }]);
