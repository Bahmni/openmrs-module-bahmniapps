'use strict';

angular.module('bahmni.clinical')
    .directive('recentPatients', function () {

        var controller = function ($rootScope, $scope, $state, clinicalDashboardConfig, $stateParams) {
            $scope.recentlyViewedPatients = _.first($rootScope.currentUser.recentlyViewedPatients, clinicalDashboardConfig.getMaxRecentlyViewedPatients());
            var patientIndex = _.findIndex($scope.recentlyViewedPatients, function(patientHistoryEntry) {
                return patientHistoryEntry.uuid === $scope.patient.uuid;
            });

            $scope.configName = $stateParams.configName;
            $scope.hasNext = function () {
                return patientIndex != 0;
            };

            $scope.hasPrevious = function () {
                return patientIndex >= 0 && $scope.recentlyViewedPatients.length-1 != patientIndex;
            };

            $scope.next = function () {
                if ($scope.hasNext()) {
                    $scope.goToDashboard($scope.recentlyViewedPatients[patientIndex-1].uuid);
                }
            };

            $scope.previous = function () {
                if ($scope.hasPrevious()) {
                    $scope.goToDashboard($scope.recentlyViewedPatients[patientIndex+1].uuid);
                }
            };

            $scope.goToDashboard = function(patientUuid){
                $state.go('patient.dashboard', {configName: $scope.configName, patientUuid: patientUuid});
            };
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "dashboard/views/recentPatients.html"
        };
    });