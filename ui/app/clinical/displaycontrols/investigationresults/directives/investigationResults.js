'use strict';

angular.module('bahmni.clinical')
    .directive('investigationResults', ['labOrderResultService', 'spinner', function (labOrderResultService, spinner) {
        var controller = function ($scope) {
            var defaultParams = {
                showTable: true,
                showChart: true,
                numberOfVisits: 1,
                chartConfig: {}
            };
            $scope.params = angular.extend(defaultParams, $scope.params);

            var params = {
                patientUuid: $scope.params.patientUuid,
                numberOfVisits: $scope.params.numberOfVisits,
                visitUuids: $scope.params.visitUuids,
                initialAccessionCount: $scope.params.initialAccessionCount,
                latestAccessionCount: $scope.params.latestAccessionCount,
                sortResultColumnsLatestFirst: $scope.params.chartConfig.sortResultColumnsLatestFirst,
                groupOrdersByPanel: $scope.params.chartConfig.groupByPanel
            };
            $scope.initialization = labOrderResultService.getAllForPatient(params)
                .then(function (results) {
                    $scope.investigationResults = results;
                });
        };

        var link = function ($scope, element) {
            spinner.forPromise($scope.initialization, element);
        };

        return {
            restrict: 'E',
            controller: controller,
            link: link,
            templateUrl: "displaycontrols/investigationresults/views/investigationResults.html",
            scope: {
                params: "="
            }
        };
    }]);
