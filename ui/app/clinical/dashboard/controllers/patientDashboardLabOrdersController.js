'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$stateParams',
        function ($scope, $stateParams) {
            $scope.dashboardParams = $scope.dashboard.getSectionByName("labOrders").dashboardParams || {};
            $scope.dashboardParams.patientUuid = $stateParams.patientUuid;

            $scope.dialogData = {
                "patient": $scope.patient,
                "allLabDetails": $scope.dashboard.getSectionByName("labOrders").allLabDetails || {}
            };
        }]);