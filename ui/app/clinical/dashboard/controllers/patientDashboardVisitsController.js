'use strict';
angular.module('bahmni.clinical')
    .controller('PatientDashboardVisitsController', ['$scope', '$stateParams', 'clinicalAppConfigService',
        function ($scope, $stateParams, clinicalAppConfigService) {
            
            $scope.setVisitsHistory = function(visitHistory) {
               $scope.visitHistory = visitHistory;
            };
            $scope.noOfVisits = $scope.visitHistory.visits.length;

            $scope.setPatient = function(patient) {
                $scope.patient = patient;
            };
            
            $scope.visitsCountAndPatient = {"noOfVisits": $scope.noOfVisits, "patient": $scope.patient};
            
            $scope.dashboardParams = clinicalAppConfigService
                .getPatientDashBoardSectionByName("visits")
                .dashboardParams || {};
            $scope.patientUuid = $stateParams.patientUuid;

        }]);