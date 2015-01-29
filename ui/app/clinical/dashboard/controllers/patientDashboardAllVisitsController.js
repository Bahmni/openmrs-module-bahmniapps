'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardAllVisitsController', ['$scope', '$state', '$stateParams', 'dashboardConfig',
        function ($scope, $state, $stateParams, dashboardConfig) {
            $scope.patient = $scope.ngDialogData.patient;
            $scope.noOfVisits = $scope.ngDialogData.noOfVisits;

            var defaultParams = {
                maximumNoOfVisits: $scope.noOfVisits ? $scope.noOfVisits : 0
            };

            $scope.params = angular.extend(defaultParams, $scope.params);
            $scope.params = angular.extend(dashboardConfig.getSectionByName("visits"), $scope.params);
            $scope.patientUuid = $stateParams.patientUuid;

        }]);