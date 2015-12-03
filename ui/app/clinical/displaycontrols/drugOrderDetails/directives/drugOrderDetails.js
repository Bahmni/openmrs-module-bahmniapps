'use strict';

angular.module('bahmni.clinical')
    .directive('drugOrderDetails', ['TreatmentService', 'spinner', function (treatmentService, spinner) {
        var controller = function ($scope) {

            var init = function () {
               return treatmentService.getAllDrugOrdersFor($scope.params.patientUuid, $scope.params.drugNames).then(function(response){
                    $scope.drugOrders = response;
                })
            };

            $scope.showDetails = false;
            $scope.toggle = function (drugOrder) {
                drugOrder.showDetails = !drugOrder.showDetails;
            };

            spinner.forPromise(init());
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                params: "="
            },
            templateUrl: "displaycontrols/drugOrderDetails/views/drugOrderDetails.html"
        };
    }]);