'use strict';
angular.module('bahmni.clinical')
    .controller('PatientDashboardVisitsController', ['$scope', '$stateParams',
        function ($scope, $stateParams) {

            $scope.setVisitsHistory = function (visitHistory) {
                $scope.visitHistory = visitHistory;
            };
            $scope.noOfVisits = $scope.visitHistory.visits.length;

            $scope.setPatient = function (patient) {
                $scope.patient = patient;
            };

            $scope.visitsCountAndPatient = {"noOfVisits": $scope.noOfVisits, "patient": $scope.patient};

            $scope.dashboardParams = $scope.dashboardConfig.getSectionByName("visits").dashboardParams || {};
            $scope.patientUuid = $stateParams.patientUuid;

        }]);