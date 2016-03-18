'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$stateParams',
        function ($scope, $stateParams) {
            $scope.dashboardParams = $scope.dashboard.getSectionByType("labOrders").dashboardParams || {};
            $scope.dashboardParams.patientUuid = $stateParams.patientUuid;

            $scope.dialogData = {
                "patient": $scope.patient,
                "allLabDetails": $scope.dashboard.getSectionByType("labOrders").allLabDetails || {}
            };
        }]);