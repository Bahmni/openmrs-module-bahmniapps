angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$rootScope', '$stateParams', 'patientVisitHistoryService', 'encounterService', '$q',
        function ($scope, $rootScope, $stateParams, patientVisitHistoryService, encounterService, $q) {
            $scope.test = "randomStuff";
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

                var getUniqueOrders = function (orderGroupWithResultsArgs) {
                    var flattenOrders = function (orderGroupWithResults) {
                        return  orderGroupWithResults.map(function (orderGroup) {
                            return orderGroup.orders;
                        }).reduce(function (a, b) {
                            return a.concat(b);
                        });
                    };

                    var unique = function (orderList) {
                        var contains = function (order, orderList) {
                            return orderList.some(function (orderInList) {
                                return orderInList.concept.name === order.concept.name;
                            });
                        };
                        var uniqueTests = [];
                        orderList.forEach(function (order) {
                            if (!contains(order, uniqueTests)) {
                                uniqueTests.push(order);
                            }
                        });
                        return uniqueTests;
                    }

                    return unique(flattenOrders(orderGroupWithResultsArgs));
                };

                var getDisplayListForUniqueOrders = function (uniqueTests) {
                    var displayList = [];
                    uniqueTests.forEach(function (uniqueOrder) {
                        displayList = displayList.concat(Bahmni.Clinical.TestOrder.create(uniqueOrder, $rootScope.allTestsAndPanelsConcept).displayList());
                    });
                    return displayList;
                };


                if ($scope.visits) {
                    var lastTwoVisitUuids = getLastNVisitUuids($scope.visits, 2);
                    encounterService.searchForVisits(lastTwoVisitUuids).success(function (encounterTransactions) {

                        var orderGroupWithResults = new Bahmni.Clinical.OrderGroupWithObs().create(encounterTransactions, 'testOrders', isLabTests, $rootScope.allTestsAndPanelsConcept, "visitUuid");
                        var uniqueTests = getUniqueOrders(orderGroupWithResults);
                        var displayList = getDisplayListForUniqueOrders(uniqueTests);

                        $scope.patientSummary.data = displayList;
                        if ($scope.patientSummary.data.length == 0) {
                            $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoLabOrders;
                        }
                    });
                }
            };

            init();

        }]);