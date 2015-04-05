'use strict';

angular.module('bahmni.clinical')
    .directive('recentPatients', function () {

        var controller = function ($rootScope, $scope, $state) {
            var recentlyViewedPatients = $rootScope.currentUser.recentlyViewedPatients;
            var patientIndex = _.findIndex(recentlyViewedPatients, function(patientHistoryEntry) {
                return patientHistoryEntry.uuid === $scope.patient.uuid;
            });

            $scope.hasNext = function () {
                return patientIndex != 0;
            };

            $scope.hasPrevious = function () {
                return patientIndex >= 0 && recentlyViewedPatients.length-1 != patientIndex;
            };

            $scope.next = function () {
                if ($scope.hasNext()) {
                    $scope.goToDashboard(recentlyViewedPatients[patientIndex-1].uuid);
                }
            };

            $scope.previous = function () {
                if ($scope.hasPrevious()) {
                    $scope.goToDashboard(recentlyViewedPatients[patientIndex+1].uuid);
                }
            };

            $scope.goToDashboard = function(patientUuid){
                $state.go('patient.dashboard', {patientUuid: patientUuid});
            };
        };

        return {
            restrict: 'E',
            controller: controller,
            replacet: true,
            templateUrl: "dashboard/views/recentPatients.html"
        };
    });