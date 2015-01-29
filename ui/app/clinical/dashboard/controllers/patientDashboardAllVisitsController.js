'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardAllVisitsController', ['$scope', '$state', '$stateParams',
        function ($scope, $state, $stateParams) {
            $scope.patient = $scope.ngDialogData.patient;
            $scope.noOfVisits = $scope.ngDialogData.noOfVisits;

            var defaultParams = {
                maximumNoOfVisits: $scope.noOfVisits ? $scope.noOfVisits : 0
            };
            $scope.params = angular.extend(defaultParams, $scope.params);
            var summaryPageParams = $scope.dashboardConfig.getSectionByName("visits");
            $scope.params = angular.extend(summaryPageParams, $scope.params);
            $scope.patientUuid = $stateParams.patientUuid;

        }]);