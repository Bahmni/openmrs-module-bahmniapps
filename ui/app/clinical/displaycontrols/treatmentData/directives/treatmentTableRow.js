'use strict';

angular.module('bahmni.clinical')
    .directive('treatmentTableRow', function () {
        var controller = function ($scope, $rootScope, appService) {
            $scope.selectedDrugOrder = {};
            $scope.openModal = false;
            $scope.enableIPDFeature = appService.getAppDescriptor().getConfigValue("enableIPDFeature");
            const enable24HourTimers = appService.getAppDescriptor().getConfigValue("enable24HourTimers");
            var drugChartSliderScheduleFrequencies = [];
            var drugChartSliderStartTimeFrequencies = [];
            if ($scope.enableIPDFeature === true) {
                drugChartSliderScheduleFrequencies = appService.getAppDescriptor().getConfigValue("drugChartScheduleFrequencies");
                drugChartSliderStartTimeFrequencies = appService.getAppDescriptor().getConfigValue("drugChartStartTimeFrequencies");
            }
            $scope.showDetails = false;
            if ($scope.params.showProvider === undefined) {
                $scope.params.showProvider = true;
            }
            $scope.toggle = function () {
                $scope.showDetails = !$scope.showDetails;
            };

            $scope.drugChartSlider = {
                hostData: {
                    drugOrder: {},
                    patientId: $scope.params.patientUuid,
                    scheduleFrequencies: drugChartSliderScheduleFrequencies,
                    startTimeFrequencies: drugChartSliderStartTimeFrequencies,
                    enable24HourTimers: enable24HourTimers
                },
                hostApi: {
                    onModalClose: function () {
                        $scope.openModal = false;
                        $scope.$apply();
                    },
                    onModalSave: function () {
                        $scope.openModal = false;
                        $scope.drugChartSliderNotification.hostData.notificationKind = "success";
                        $scope.showModalWarningMessage = true;
                        $scope.$apply();
                    },
                    onModalCancel: function () {
                        $scope.openModal = false;
                        $scope.drugChartSliderNotification.hostData.notificationKind = "warning";
                        $scope.showModalWarningMessage = true;
                        $scope.$apply();
                    }
                }
            };

            $scope.drugChartSliderNotification = {
                hostData: {
                    notificationKind: ""
                },
                hostApi: {
                    onClose: function () {
                        $scope.showModalWarningMessage = false;
                        $scope.$apply();
                    }
                }
            };

            $scope.openDrugChartSlider = function (drugOrder) {
                $scope.drugChartSlider.hostData.drugOrder = drugOrder;
                $scope.openModal = true;
            };
        };

        return {
            restrict: 'A',
            controller: controller,
            scope: {
                drugOrder: "=",
                params: "="
            },
            templateUrl: "displaycontrols/treatmentData/views/treatmentTableRow.html"
        };
    });
