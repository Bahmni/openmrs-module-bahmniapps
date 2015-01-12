'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardAllVisitsController', ['$scope', '$state', '$stateParams', 'clinicalAppConfigService',
        function ($scope, $state, $stateParams, clinicalAppConfigService) {
            $scope.visits = $scope.ngDialogData.visits;
            $scope.patient = $scope.ngDialogData.patient;

            var defaultParams = {
                showTable: true,
                maximumNoOfVisits: $scope.visits ? $scope.visits.length : 0
            };

            var summaryPageParams = clinicalAppConfigService
                .getPatientDashBoardSectionByName("visits")
                .summaryPageParams || {};

            $scope.params = angular.extend(summaryPageParams, $scope.params);
            
        }]);