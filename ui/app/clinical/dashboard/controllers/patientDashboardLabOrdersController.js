'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$stateParams',
        function ($scope, $stateParams) {
            $scope.dashboardConfig = $scope.dashboard.getSectionByType("labOrders").dashboardConfig || {};
            $scope.dashboardConfig.patientUuid = $stateParams.patientUuid;

            $scope.dialogData = {
                "patient": $scope.patient,
                "expandedViewConfig": $scope.dashboard.getSectionByType("labOrders").expandedViewConfig || {}
            };
        }]);
