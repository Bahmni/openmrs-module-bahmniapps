'use strict';

angular.module('bahmni.clinical')
    .directive('investigationChart', function () {
        var controller = function ($scope) {
            var defaultParams = {
                noLabOrdersMessage: "No Lab Orders for this patient."
            };

            $scope.params = angular.extend(defaultParams, $scope.params);

            $scope.showInvestigationChart = false;

            $scope.toggleInvestigationChart = function () {
                $scope.showInvestigationChart = !$scope.showInvestigationChart;
            };

            $scope.getUploadedFileUrl = function (uploadedFileName) {
                return Bahmni.Common.Constants.labResultUploadedFileNameUrl + uploadedFileName;
            };
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                accessions: "=",
                params: "="
            },
            templateUrl: "views/displayControls/investigationChart.html"
        };
    });