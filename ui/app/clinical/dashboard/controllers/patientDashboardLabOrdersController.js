'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$stateParams',
        function ($scope, $stateParams) {
            $scope.dashboardParams = $scope.dashboardConfig.getSectionByName("labOrders").dashboardParams || {};
            $scope.dashboardParams.patientUuid = $stateParams.patientUuid;

            $scope.dialogData = {
                "patient": $scope.patient,
                "summaryPageParams": $scope.dashboardConfig.getSectionByName("labOrders").summaryPageParams || {}
            };
        }]);