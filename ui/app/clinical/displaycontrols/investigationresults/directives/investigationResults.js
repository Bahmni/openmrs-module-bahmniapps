'use strict';

angular.module('bahmni.clinical')
    .directive('investigationResults', ['LabOrderResultService', 'spinner', function (labOrderResultService, spinner) {
        var controller = function ($scope) {
            var defaultParams = {
                showTable: true,
                showChart: true,
                numberOfVisits: 1
            };
            $scope.params = angular.extend(defaultParams, $scope.params);

            var params = {
                patientUuid: $scope.params.patientUuid,
                numberOfVisits: $scope.params.numberOfVisits,
                visitUuids: $scope.params.visitUuids,
                initialAccessionCount: $scope.params.initialAccessionCount,
                latestAccessionCount: $scope.params.latestAccessionCount
            };
            spinner.forPromise(labOrderResultService.getAllForPatient(params)
                .then(function (results) {
                    $scope.investigationResults = results;
                }));
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                params: "="
            },
            templateUrl: "displaycontrols/investigationresults/views/investigationResults.html"
        };
    }]);