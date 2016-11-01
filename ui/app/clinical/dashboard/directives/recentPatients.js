'use strict';

angular.module('bahmni.clinical')
    .directive('recentPatients', function () {
        var controller = function ($rootScope, $scope, $state, clinicalDashboardConfig, $stateParams, patientService, sessionService) {
            var initialize = function () {
                $scope.search = new Bahmni.Common.PatientSearch.Search(undefined);
                $scope.showPatientsList = false;
            };

            $scope.recentlyViewedPatients = _.take($rootScope.currentUser.recentlyViewedPatients, clinicalDashboardConfig.getMaxRecentlyViewedPatients());
            $scope.configName = $stateParams.configName;

            var patientIndex = _.findIndex($scope.recentlyViewedPatients, function (patientHistoryEntry) {
                return patientHistoryEntry.uuid === $scope.patient.uuid;
            });

            $scope.hasNext = function () {
                return patientIndex !== 0;
            };

            $scope.togglePatientsList = function () {
                $scope.showPatientsList = !$scope.showPatientsList;
            };

            $scope.hasPrevious = function () {
                return patientIndex >= 0 && $scope.recentlyViewedPatients.length - 1 !== patientIndex;
            };

            $scope.next = function () {
                if ($scope.hasNext()) {
                    $scope.goToDashboard($scope.recentlyViewedPatients[patientIndex - 1].uuid);
                }
            };

            $scope.previous = function () {
                if ($scope.hasPrevious()) {
                    $scope.goToDashboard($scope.recentlyViewedPatients[patientIndex + 1].uuid);
                }
            };

            $scope.goToDashboard = function (patientUuid) {
                $state.go('patient.dashboard', {configName: $scope.configName, patientUuid: patientUuid});
            };

            $scope.getActivePatients = function () {
                if ($scope.search.patientsCount() > 0) {
                    return;
                }
                var params = { q: Bahmni.Clinical.Constants.globalPropertyToFetchActivePatients,
                    location_uuid: sessionService.getLoginLocationUuid()};
                patientService.findPatients(params).then(function (response) {
                    $scope.search.updatePatientList(response.data);
                });
            };

            initialize();
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "dashboard/views/recentPatients.html"
        };
    });
