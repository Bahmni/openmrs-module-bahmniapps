angular.module('bahmni.clinical')
    .controller('PatientDashboardLabSummaryController', ['$scope', '$rootScope', 'encounterService', '$q', 'spinner',
        function ($scope, $rootScope, encounterService, $q, spinner) {

            $scope.allVisits = [];
            var getAllVisitUuids = function () {
                var visits = $rootScope.visits;
                visits.sort(function (visit1, visit2) {
                    return visit1.startDatetime - visit2.startDatetime;
                });

                return visits.map(function (visit) {
                    return visit.uuid;
                });
            };


            var init = function () {
                if ($rootScope.visits) {
                    var visits = getAllVisitUuids();

                    spinner.forPromise(encounterService.searchForVisits(visits).success(function (encounterTransactions) {
                        var groupedEncounterTransactions = _.groupBy(encounterTransactions, function (encounterTransaction) {
                            return encounterTransaction.visitUuid;
                        });
                        for (var key in groupedEncounterTransactions) {
                            var visit = Bahmni.Clinical.Visit.create(groupedEncounterTransactions[key], $rootScope.consultationNoteConcept, $rootScope.labOrderNotesConcept, $rootScope.encounterConfig, $rootScope.allTestsAndPanelsConcept, [], undefined);
                            $scope.allVisits.push(visit);
                        }
                    }));
                }
            };

//            $scope.resetCurrentVisit = function (visit) {
//                $scope.currentVisit = ($scope.isCurrentVisit(visit)) ? $scope.newVisit : visit;
//            };
//
//            $scope.isCurrentVisit = function (visit) {
//                return $scope.currentVisit && $scope.currentVisit.uuid === visit.uuid;
//            };

            init();
        }]);