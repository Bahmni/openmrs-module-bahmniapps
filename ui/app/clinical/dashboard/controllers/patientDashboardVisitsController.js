'use strict';
angular.module('bahmni.clinical')
    .controller('PatientDashboardVisitsController', ['$scope', '$stateParams',
        function ($scope, $stateParams) {
            $scope.noOfVisits = $scope.visitHistory.visits.length;
            $scope.dialogData = {
                "noOfVisits": $scope.noOfVisits,
                "patient": $scope.patient,
                "sectionConfig": $scope.dashboard.getSectionByType("visits")
            };

            $scope.dashboardConfig = $scope.dashboard.getSectionByType("visits").dashboardConfig || {};
            $scope.patientUuid = $stateParams.patientUuid;
        }]);
