'use strict';

angular.module('bahmni.common.displaycontrol.drugOrdersSection')
    .directive('drugOrdersSection', ['TreatmentService', 'spinner', function (treatmentService, spinner) {
        var controller = function ($scope) {

            var drugNames=[ ];

            var columnHeaderMappings = {
                "drugName": "DRUG_DETAILS_DRUG_NAME",
                "dosage": "DRUG_DETAILS_DOSE_INFO",
                "route": "DRUG_DETAILS_ROUTE",
                "frequency": "DRUG_DETAILS_FREQUENCY",
                "startDate": "DRUG_DETAILS_START_DATE",
                "stopDate": "DRUG_DETAILS_STOP_DATE",
                "stopReason": "DRUG_DETAILS_ORDER_REASON_CODED",
                "stopReasonNotes": "DRUG_DETAILS_ORDER_REASON_TEXT"
            };

            var initialiseColumnHeaders = function() {
                $scope.columnHeaders = _.values(_.pick(columnHeaderMappings, $scope.config.fieldNames));
            };

            $scope.shouldShow= function(column){
                return _.indexOf($scope.config.fieldNames, column) != -1;
            };

            var init = function () {
                initialiseColumnHeaders();
                return treatmentService.getAllDrugOrdersFor($scope.patientUuid, $scope.config.includeConceptSet, $scope.config.excludeConceptSet, $scope.config.active).then(function (response) {
                    $scope.drugOrders = sortOrders(response);
                });
            };


            $scope.toggle = function (drugOrder) {
                drugOrder.showDetails = !drugOrder.showDetails;
            };

            var sortOrders = function(drugOrders){
                var drugOrderUtil = Bahmni.Clinical.DrugOrder.Util;
                var sortedDrugOrders = [];
                sortedDrugOrders.push(drugOrderUtil.sortDrugOrders(drugOrders));
                return _.flatten(sortedDrugOrders).reverse();
            };

            spinner.forPromise(init());
        };
        return {
            restrict: 'E',
            controller: controller,
            scope: {
                config: "=",
                patientUuid: "="
            },
            templateUrl: "../common/displaycontrols/drugOrdersSection/views/drugOrdersSection.html"
        };
    }]);