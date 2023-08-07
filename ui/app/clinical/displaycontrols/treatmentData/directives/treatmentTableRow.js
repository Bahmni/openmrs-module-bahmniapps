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

            $scope.drugChartModalData = {
                drugOrder: $scope.drugOrder,
                patientId: $scope.params.patientUuid,
                scheduleFrequencies: drugChartModalScheduleFrequencies,
                startTimeFrequencies: drugChartModalStartTimeFrequencies,
                enable24HourTimers: enable24HourTimers,
            }

            $scope.drugChartModalApi = {
                onModalClose: function () {
                    $scope.openModal = false;
                    $scope.$apply();
                },
                onModalSave: function () {
                    $scope.openModal = false;
                    $scope.drugChartModalNotificationData.notificationKind = "success";
                    $scope.showModalWarningMessage = true;
                    $scope.$apply();
                },
                onModalCancel: function () {
                    $scope.openModal = false;
                    $scope.drugChartModalNotificationData.notificationKind = "warning";
                    $scope.showModalWarningMessage = true;
                    $scope.$apply();
                },
            };

            $scope.drugChartModalNotificationData = {
                notificationKind: ""
            };

            $scope.drugChartModalNotificationApi = {
                onClose: function () {
                    $scope.closeWarnings();
                }
            };

            $scope.openDrugChartModal = function (drugOrder) {
                $scope.selectedDrugOrder = drugOrder;
                $scope.openModal = true;
            };

            $scope.closeWarnings = function () {
                $scope.showModalWarningMessage = false;
                $scope.$apply();
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
