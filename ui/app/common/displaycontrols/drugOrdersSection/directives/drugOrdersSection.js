'use strict';

angular.module('bahmni.common.displaycontrol.drugOrdersSection')
    .directive('drugOrdersSection', ['TreatmentService', 'spinner', function (treatmentService, spinner) {
        var controller = function ($scope) {

            $scope.toggleDisplay = function () {
                $scope.toggle = ! $scope.toggle
            };

            $scope.columnHeaders = {
                "drugName": "DRUG_DETAILS_DRUG_NAME",
                "dosage": "DRUG_DETAILS_DOSE_INFO",
                "route": "DRUG_DETAILS_ROUTE",
                "duration": "DRUG_DETAILS_DURATION",
                "frequency": "DRUG_DETAILS_FREQUENCY",
                "startDate": "DRUG_DETAILS_START_DATE",
                "stopDate": "DRUG_DETAILS_STOP_DATE",
                "stopReason": "DRUG_DETAILS_ORDER_REASON_CODED",
                "stopReasonNotes": "DRUG_DETAILS_ORDER_REASON_TEXT"
            };

            var initialiseColumns = function() {
                $scope.columns = $scope.config.columns;
                if(!$scope.columns){
                    $scope.columns = _.keys($scope.columnHeaders);
                }
            };

            var init = function () {
                initialiseColumns();
                if (_.isEmpty($scope.config.title) && _.isEmpty($scope.config.translationKey)){
                    $scope.config.title = "Drug Orders";
                }
                return treatmentService.getAllDrugOrdersFor($scope.patientUuid, $scope.config.includeConceptSet, $scope.config.excludeConceptSet, $scope.config.active).then(function (response) {
                    $scope.drugOrders = sortOrders(response);
                });
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