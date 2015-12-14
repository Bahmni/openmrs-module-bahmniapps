'use strict';

angular.module('bahmni.common.displaycontrol.drugOrderDetails')
    .directive('drugOrderDetails', ['TreatmentService', 'spinner', function (treatmentService, spinner) {
        var controller = function ($scope) {

            var init = function () {
               return treatmentService.getAllDrugOrdersFor($scope.patient.uuid, $scope.section.dashboardParams.drugNames).then(function(response){
                    $scope.drugOrders = response;
                })
            };

            $scope.columns = $scope.section.dashboardParams.columns ;
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
                section: "=",
                patient: "="
            },
            templateUrl: "../common/displaycontrols/drugOrderDetails/views/drugOrderDetails.html"
        };
    }]);