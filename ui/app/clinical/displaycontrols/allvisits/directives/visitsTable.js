'use strict';

angular.module('bahmni.clinical')
    .directive('visitsTable', ['patientVisitHistoryService', 'spinner', '$state', '$q', function (patientVisitHistoryService, spinner, $state, $q) {
        var controller = function ($scope) {
            $scope.openVisit = function(visit) {
                if($scope.$parent.closeThisDialog){
                    $scope.$parent.closeThisDialog("closing modal");
                }
                $state.go('patient.dashboard.visit', {visitUuid: visit.uuid});
            };

            $scope.hasVisits = function () {
                return $scope.visits && $scope.visits.length > 0;
            };

            var getVisits = function () {
                return patientVisitHistoryService.getVisitHistory($scope.patientUuid);
            };

            var init = function () {
                return $q.all([getVisits()]).then(function (results) {
                    $scope.visits = results[0].visits;
                    $scope.patient = {uuid: $scope.patientUuid};
                });
            };


            spinner.forPromise(init());

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