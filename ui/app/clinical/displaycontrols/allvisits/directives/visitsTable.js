'use strict';

angular.module('bahmni.clinical')
    .directive('visitsTable', ['patientVisitHistoryService', 'spinner', '$state', function (patientVisitHistoryService, spinner, $state) {
        var controller = function ($scope) {
            spinner.forPromise(patientVisitHistoryService.getVisitHistory($scope.patientUuid).then(function (visitHistory) {
                $scope.visits = visitHistory.visits;
            }));
            
            $scope.openVisit = function(visit) {
                $state.go('patient.visit', {visitUuid: visit.uuid});
            };

            $scope.hasVisits = function () {
                return $scope.visits && $scope.visits.length > 0;
            };
            $scope.params = angular.extend(
                {
                    maximumNoOfVisits: 4,
                    title: "Visits"
                }, $scope.params);

            $scope.noVisitsMessage = "No Visits for this patient.";
        };
        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "displaycontrols/allvisits/views/visitsTable.html",
            scope: {
                params: "=",
                patientUuid: "="
            }
        };
    }]);