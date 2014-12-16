'use strict';

angular.module('bahmni.clinical')
    .directive('investigationResults', ['LabOrderResultService', 'spinner', function (labOrderResultService, spinner) {
        var controller = function ($scope) {
            var defaultParams = {
                showInvestigationTable: true,
                showInvestigationChart: true
            };
            $scope.params = angular.extend(defaultParams, $scope.params);

            spinner.forPromise(labOrderResultService.getAllForPatient($scope.params.patientUuid, $scope.params.numberOfVisits, $scope.params.visitUuids)
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
            templateUrl: "views/displayControls/investigationResults.html"
        };
    }]);