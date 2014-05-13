angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$rootScope', '$stateParams', 'patientVisitHistoryService', 'encounterService', '$q',
        function ($scope, $rootScope, $stateParams, patientVisitHistoryService, encounterService, $q) {
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.patientSummary = {message: "No Lab Orders made for this patient."};
            $scope.labOrdersForLatestVisits = {
                "Latest": {displayName: "Latest Visit", labOrders: undefined},
                "Previous": {displayName: "Previous Visit", labOrders: undefined}
            };

            function getLatestLabOrder(visit) {
                var groupedLabOrders = _.groupBy(visit.labOrders, function (labOrder) {
                    return labOrder.concept.name;
                });

                var labOrders = [];
                for (var key in groupedLabOrders) {
                    labOrders.push(groupedLabOrders[key][0])
                }
                return labOrders;
            }

            var getLastNVisitUuids = function (visits, number) {
                var lastNVisits = visits.slice(0, number);
                lastNVisits.sort(function (visit1, visit2) {
                    return visit1.startDatetime - visit2.startDatetime;
                });

                return lastNVisits.map(function (visit) {
                    return visit.uuid;
                });
            };


            var init = function () {

                if ($scope.visits) {
                    var lastTwoVisitUuids = getLastNVisitUuids($scope.visits, 2);

                    encounterService.searchForVisits(lastTwoVisitUuids).success(function (encounterTransactions) {
                        var groupedEncounterTransactions = _.groupBy(encounterTransactions, function (encounterTransaction) {
                            return encounterTransaction.visitUuid;
                        });
                        for (var key in groupedEncounterTransactions) {
                            var visit = Bahmni.Clinical.Visit.create(groupedEncounterTransactions[key], $rootScope.consultationNoteConcept, $rootScope.labOrderNotesConcept, $rootScope.encounterConfig, $rootScope.allTestsAndPanelsConcept, [], undefined);

                            var labOrders = getLatestLabOrder(visit);
                            if (!$scope.labOrdersForLatestVisits.Latest.labOrders) {
                                $scope.labOrdersForLatestVisits.Latest.labOrders = labOrders;
                            } else {
                                $scope.labOrdersForLatestVisits.Previous.labOrders = labOrders;
                            }
                        }
                    });
                }
            };

            function hasLatestLabOrders() {
                return $scope.labOrdersForLatestVisits.Latest.labOrders && $scope.labOrdersForLatestVisits.Latest.labOrders.length > 0;
            }

            function hasPreviousLabOrders() {
                return $scope.labOrdersForLatestVisits.Previous.labOrders && $scope.labOrdersForLatestVisits.Previous.labOrders.length > 0;
            }

            $scope.hasLabOrders = function () {
                return hasLatestLabOrders() || hasPreviousLabOrders();
            };

            $scope.hasRange = function (result) {
                return result.minNormal && result.maxNormal;
            };

            $scope.hasResult = function(test){
                return test.results.length > 0
            };

            $scope.isReferredOut = function(results){
                return results.length > 0 && results[0].referredOut;
            };
            init();
        }]);