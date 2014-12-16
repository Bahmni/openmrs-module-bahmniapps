'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardLabOrdersController', ['$scope', '$stateParams', 'clinicalConfigService',
        function ($scope, $stateParams, clinicalConfigService) {
            $scope.dashboardParams = clinicalConfigService
                .getPatientDashBoardSectionByName("labOrders")
                .dashboardParams || {};
            $scope.dashboardParams.patientUuid = $stateParams.patientUuid;
        }]);