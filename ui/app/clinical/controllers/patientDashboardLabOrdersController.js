angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$rootScope', '$stateParams', 'patientVisitHistoryService', 'encounterService', '$q',
        function ($scope, $rootScope, $stateParams, patientVisitHistoryService, encounterService, $q) {
            $scope.patientUuid = $stateParams.patientUuid;
            var createObservationsObject = function (encounterTransactions) {
                return new Bahmni.Clinical.EncounterTransactionToObsMapper().map(encounterTransactions);
            };

            $scope.patientSummary = {};

            var init = function () {
                var getLastNVisitUuids = function (visits, number) {
                    var lastNVisits = visits.slice(0, number);
                    return lastNVisits.map(function (visit) {
                        return visit.uuid;
                    });
                };

                var isLabTests = function (order) {
                    var labTestOrderTypeUuid = $rootScope.encounterConfig.orderTypes[Bahmni.Clinical.Constants.labOrderType];
                    return order.orderTypeUuid === labTestOrderTypeUuid;
                };

                var getUniqueOrdersWithinAVisit = function (orderGroupWithResultsArgs) {
                    var uniqueOrders = [];
                    orderGroupWithResultsArgs.forEach(function(orderGroupWithResultsForAVisit) {
                        var items = Bahmni.Clinical.OrdersUtil.latest(orderGroupWithResultsForAVisit.orders);
                        uniqueOrders = uniqueOrders.concat(items);
                    })
                    return uniqueOrders;
                };

                var getDisplayListForUniqueOrders = function (uniqueTests) {
                    var displayList = [];
                    uniqueTests.forEach(function (uniqueOrder) {
                        displayList = displayList.concat(Bahmni.Clinical.LabOrder.create(uniqueOrder, $rootScope.allTestsAndPanelsConcept).getDisplayList());
                    });
                    return displayList;
                };


                if ($scope.visits) {
                    var lastTwoVisitUuids = getLastNVisitUuids($scope.visits, 2);
                    encounterService.searchForVisits(lastTwoVisitUuids).success(function (encounterTransactions) {

                        var orderGroupWithResults = new Bahmni.Clinical.OrdersMapper().create(encounterTransactions, 'testOrders', isLabTests, "visitUuid", $rootScope.allTestsAndPanelsConcept);
                        var displayList = [];
                        if (orderGroupWithResults.length != 0) {
                            var uniqueTests = getUniqueOrdersWithinAVisit(orderGroupWithResults);
                            displayList = getDisplayListForUniqueOrders(uniqueTests);
                        }

                        $scope.patientSummary.data = displayList;
                        if ($scope.patientSummary.data.length == 0) {
                            $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoLabOrders;
                        }
                    });
                }
            };

            init();

        }]);