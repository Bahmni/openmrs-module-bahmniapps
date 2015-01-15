'use strict';

angular.module('bahmni.clinical')
    .directive('treatmentData', ['TreatmentService', 'spinner', function (treatmentService, spinner) {
        var controller = function ($scope) {
            var defaultParams = {
                showTable: true,
                showChart: true,
                numberOfVisits: 1
            };
            $scope.params = angular.extend(defaultParams, $scope.params);

            var init = function () {
                return treatmentService.getPrescribedAndActiveDrugOrdersFromServer($scope.params.patientUuid, $scope.params.numberOfVisits, $scope.params.showOtherActive).then(function (response) {
                    $scope.treatmentData = response.data;
                });
            };

            spinner.forPromise(init());

        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                params: "="
            },
            templateUrl: "displaycontrols/treatmentData/views/treatmentData.html"
        };
    }]);