'use strict';

angular.module('bahmni.common.displaycontrol.drugOrderDetails')
    .directive('drugOrderDetails', ['TreatmentService', 'spinner', function (treatmentService, spinner) {
        var controller = function ($scope) {

            var init = function () {
                return treatmentService.getAllDrugOrdersFor($scope.patient.uuid, $scope.section.dashboardParams.drugNames).then(function (response) {
                    $scope.drugOrders = sortOrders(response);
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
                var now = new Date();
                var activeAndScheduled = _.filter(response, function (order) {
                    return order.isActive() || order.isScheduled();
                });
                var autoExpiredDrugs = _.filter(response, function(order){
                    return order.effectiveStopDate && order.effectiveStopDate <= now && order.dateStopped === null;
                });
                var inActiveOrders = _.filter(response, function (order) {
                    return order.isDiscontinuedOrStopped();
                });

                var partitionedDrugOrders = _.groupBy(activeAndScheduled, function (drugOrder) {
                    return (drugOrder.effectiveStartDate > now) ? "scheduled" : "active";
                });
                var sortedDrugOrders = [];
                sortedDrugOrders.push(drugOrderUtil.sortDrugOrders(partitionedDrugOrders.scheduled));
                sortedDrugOrders.push(drugOrderUtil.sortDrugOrders(partitionedDrugOrders.active));
                sortedDrugOrders.push(drugOrderUtil.sortDrugOrders(autoExpiredDrugs));
                sortedDrugOrders.push(drugOrderUtil.sortDrugOrders(inActiveOrders));
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