'use strict';
angular.module('bahmni.clinical')
    .controller('PatientDashboardVisitsController', ['$scope', '$stateParams', 'clinicalAppConfigService',
        function ($scope, $stateParams, clinicalAppConfigService) {
            
            $scope.setVisitsHistory = function(visitHistory) {
               $scope.visitHistory = visitHistory;
            };
            $scope.visits = $scope.visitHistory.visits;

            $scope.setPatient = function(patient) {
                $scope.patient = patient;
            };
            $scope.visitsAndPatient = {"visits": $scope.visits, "patient": $scope.patient};
            
            $scope.dashboardParams = clinicalAppConfigService
                .getPatientDashBoardSectionByName("visits")
                .dashboardParams || {};
            $scope.dashboardParams.patientUuid = $stateParams.patientUuid;

        }]);