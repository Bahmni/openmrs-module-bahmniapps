'use strict';
angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$stateParams', 'clinicalAppConfigService',
        function ($scope, $stateParams, clinicalAppConfigService) {
            $scope.dashboardParams = clinicalAppConfigService
                .getPatientDashBoardSectionByName("labOrders")
                .dashboardParams || {};
            $scope.dashboardParams.patientUuid = $stateParams.patientUuid;
        }]);