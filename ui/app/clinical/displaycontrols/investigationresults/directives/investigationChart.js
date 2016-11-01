'use strict';

angular.module('bahmni.clinical')
    .directive('investigationChart', function () {
        var controller = function ($scope) {
            var defaultParams = {
                noLabOrdersMessage: "No Lab Orders for this patient."
            };

            $scope.params = angular.extend(defaultParams, $scope.params);

            $scope.showChart = false;

            $scope.toggleChart = function () {
                $scope.showChart = !$scope.showChart;
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
            templateUrl: "displaycontrols/investigationresults/views/investigationChart.html"
        };
    });
