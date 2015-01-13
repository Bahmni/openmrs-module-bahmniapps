'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardAllVisitsController', ['$scope', '$state', '$stateParams', 'clinicalAppConfigService',
        function ($scope, $state, $stateParams, clinicalAppConfigService) {
            $scope.patient = $scope.ngDialogData.patient;
            $scope.noOfVisits = $scope.ngDialogData.noOfVisits;

            var defaultParams = {
                maximumNoOfVisits: $scope.noOfVisits ? $scope.noOfVisits : 0
            };
            $scope.params = angular.extend(defaultParams, $scope.params);
            
            var summaryPageParams = clinicalAppConfigService
                .getPatientDashBoardSectionByName("visits")
                .summaryPageParams || {};

            $scope.params = angular.extend(summaryPageParams, $scope.params);
            $scope.patientUuid = $stateParams.patientUuid;
            
        }]);