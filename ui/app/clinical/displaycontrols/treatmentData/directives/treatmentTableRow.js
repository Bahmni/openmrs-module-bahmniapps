'use strict';

angular.module('bahmni.clinical')
    .directive('treatmentTableRow', function () {
        var controller = function ($scope, $rootScope, appService) {
            $scope.selectedDrugOrder = {};
            $scope.openModal = false;
            $scope.enableIPDFeature = appService.getAppDescriptor().getConfigValue("enableIPDFeature");
            if ($scope.enableIPDFeature === true) {
                $scope.drugChartModalScheduleFrequencies = appService.getAppDescriptor().getConfigValue("drugChartScheduleFrequencies");
                $scope.drugChartModalStartTimeFrequencies = appService.getAppDescriptor().getConfigValue("drugChartStartTimeFrequencies");
            }
            $scope.showDetails = false;
            if ($scope.params.showProvider === undefined) {
                $scope.params.showProvider = true;
            }
            $scope.toggle = function () {
                $scope.showDetails = !$scope.showDetails;
            };
            $scope.openDrugChartModal = function (drugOrder) {
                $scope.selectedDrugOrder = drugOrder;
                $scope.openModal = true;
            };
            $scope.closeDrugChartModal = function () {
                $scope.openModal = false;
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
