'use strict';

angular.module('bahmni.clinical')
    .directive('treatmentTableRow', function () {
        var controller = function ($scope, $rootScope, appService) {
            $scope.selectedDrugOrder = {};
            $scope.openModal = false;
            $scope.enableIPDFeature = appService.getAppDescriptor().getConfigValue("enableIPDFeature");
            const enable24HourTimers = appService.getAppDescriptor().getConfigValue("enable24HourTimers");
            var drugChartModalScheduleFrequencies = [];
            var drugChartModalStartTimeFrequencies = [];
            if ($scope.enableIPDFeature === true) {
                drugChartModalScheduleFrequencies = appService.getAppDescriptor().getConfigValue("drugChartScheduleFrequencies");
                drugChartModalStartTimeFrequencies = appService.getAppDescriptor().getConfigValue("drugChartStartTimeFrequencies");
            }
            $scope.showDetails = false;
            if ($scope.params.showProvider === undefined) {
                $scope.params.showProvider = true;
            }
            $scope.toggle = function () {
                $scope.showDetails = !$scope.showDetails;
            };

            $scope.drugChartModal = {
                hostData: {
                    drugOrder: {},
                    patientId: $scope.params.patientUuid,
                    scheduleFrequencies: drugChartModalScheduleFrequencies,
                    startTimeFrequencies: drugChartModalStartTimeFrequencies,
                    enable24HourTimers: enable24HourTimers
                },
                hostApi: {
                    onModalClose: function () {
                        $scope.openModal = false;
                        $scope.$apply();
                    },
                    onModalSave: function () {
                        $scope.openModal = false;
                        $scope.drugChartModalNotification.hostData.notificationKind = "success";
                        $scope.showModalWarningMessage = true;
                        $scope.$apply();
                    },
                    onModalCancel: function () {
                        $scope.openModal = false;
                        $scope.drugChartModalNotification.hostData.notificationKind = "warning";
                        $scope.showModalWarningMessage = true;
                        $scope.$apply();
                    }
                }
            };

            $scope.drugChartModalNotification = {
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

            $scope.openDrugChartModal = function (drugOrder) {
                $scope.drugChartModal.hostData.drugOrder = drugOrder;
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
