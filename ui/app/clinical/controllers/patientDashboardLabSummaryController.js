angular.module('bahmni.clinical')
    .controller('PatientDashboardLabSummaryController', ['$scope', '$rootScope', 'encounterService', '$q', 'spinner',
        function ($scope, $rootScope, encounterService, $q, spinner) {

            var initVisit = function (visit) {
                if (visit) {
                    spinner.forPromise(encounterService.searchForVisits(visit.uuid).success(function (encounterTransactions) {
                        $scope.visit = Bahmni.Clinical.Visit.create(encounterTransactions, $rootScope.consultationNoteConcept, $rootScope.labOrderNotesConcept, $rootScope.encounterConfig, $rootScope.allTestsAndPanelsConcept, [], visit.uuid);
                    }));
                }
            };

            $scope.resetCurrentVisit = function (visit) {
                $scope.currentVisit = ($scope.isCurrentVisit(visit)) ? $scope.newVisit : visit;
                initVisit(visit);
            };

            $scope.isCurrentVisit = function (visit) {
                return $scope.currentVisit && $scope.currentVisit.uuid === visit.uuid;
            };

            $scope.currentVisit = $rootScope.visits[0];
            initVisit($scope.currentVisit);

        }]);