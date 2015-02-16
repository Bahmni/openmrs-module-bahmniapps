'use strict';
angular.module('bahmni.clinical')
    .controller('PatientDashboardVisitsController', ['$scope', '$stateParams',
        function ($scope, $stateParams) {

            $scope.noOfVisits = $scope.visitHistory.visits.length;
            $scope.dialogData = {
                "noOfVisits": $scope.noOfVisits,
                "patient": $scope.patient,
                "sectionConfig": $scope.dashboard.getSectionByName("visits")
            };

            $scope.dashboardParams = $scope.dashboard.getSectionByName("visits").dashboardParams || {};
            $scope.patientUuid = $stateParams.patientUuid;

        }]);