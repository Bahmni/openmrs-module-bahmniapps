'use strict';

angular.module('bahmni.common.displaycontrol.drugOrderDetails')
    .directive('drugOrderDetails', ['TreatmentService', 'spinner', function (treatmentService, spinner) {
        var controller = function ($scope) {

            var init = function () {
                return treatmentService.getAllDrugOrdersFor($scope.patient.uuid, $scope.section.dashboardParams.drugConceptSet).then(function (response) {
                    $scope.drugOrders = sortOrders(response).reverse();
                });
            };

            $scope.columnHeaders = ["DRUG_DETAILS_DRUG_NAME", "DRUG_DETAILS_DOSE_INFO", "DRUG_DETAILS_ROUTE", "DRUG_DETAILS_FREQUENCY",
                "DRUG_DETAILS_START_DATE", "DRUG_DETAILS_STOP_DATE", "DRUG_DETAILS_ORDER_REASON_CODED", "DRUG_DETAILS_ORDER_REASON_TEXT"];

            $scope.showDetails = false;
            $scope.toggle = function (drugOrder) {
                drugOrder.showDetails = !drugOrder.showDetails;
            };

            var sortOrders = function(response){
                var drugOrderUtil = Bahmni.Clinical.DrugOrder.Util;
                var sortedDrugOrders = [];
                if($scope.section.dashboardParams.showOnlyActive) {
                    var now = new Date();
                    var activeAndScheduled = _.filter(response, function (order) {
                        return order.isActive() || order.isScheduled();
                    });
                    var partitionedDrugOrders = _.groupBy(activeAndScheduled, function (drugOrder) {
                        return (drugOrder.effectiveStartDate > now) ? "scheduled" : "active";
                    });
                    sortedDrugOrders.push(drugOrderUtil.sortDrugOrders(partitionedDrugOrders.scheduled));
                    sortedDrugOrders.push(drugOrderUtil.sortDrugOrders(partitionedDrugOrders.active));
                }else{
                    sortedDrugOrders.push(drugOrderUtil.sortDrugOrders(response));
                }
                return _.flatten(sortedDrugOrders);
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