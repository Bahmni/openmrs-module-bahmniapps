angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$rootScope', '$stateParams', 'patientVisitHistoryService', 'encounterService', '$q',
        function ($scope, $rootScope, $stateParams, patientVisitHistoryService, encounterService, $q) {
            $scope.patientUuid = $stateParams.patientUuid;
            var lastTwoVisitUuids;
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
                    lastTwoVisitUuids = getLastNVisitUuids($scope.visits, 2);
                    encounterService.searchForVisits(lastTwoVisitUuids).success(function (encounterTransactions) {
                        var grouppedVisits = [];

                        encounterTransactions.forEach(function(encounter){
                            existingGrouppedVisit = grouppedVisits.filter(function(visit) {return visit.visitUuid == encounter.visitUuid})[0]
                            if(existingGrouppedVisit){
                                existingGrouppedVisit.records.push(encounter);
                            }
                            else{
                                if(getLastNVisitUuids($scope.visits, 1)[0] == encounter.visitUuid){
                                    grouppedVisits.push({records: [], name: "Latest", visitUuid: encounter.visitUuid});
                                }
                                else{
                                    grouppedVisits.push({records: [], name: "Previous", visitUuid: encounter.visitUuid});
                                }
                            }
                        });
                        grouppedVisits.forEach(function(grouppedVisit){
                            var orderGroupWithResults = new Bahmni.Clinical.OrdersMapper().create(grouppedVisit.records, 'testOrders', isLabTests, "visitUuid", $rootScope.allTestsAndPanelsConcept);
                            var displayList = [];
                            if (orderGroupWithResults.length != 0) {
                                var uniqueTests = getUniqueOrdersWithinAVisit(orderGroupWithResults);
                                displayList = getDisplayListForUniqueOrders(uniqueTests);
                            }
                            grouppedVisit.records = displayList;
                        });
                        $scope.patientSummary.data = grouppedVisits;
                        if ($scope.patientSummary.data.length == 0) {
                            $scope.patientSummary.message = Bahmni.Clinical.Constants.messageForNoLabOrders;
                        }
                    });
                }
            };

            init();

        }]);