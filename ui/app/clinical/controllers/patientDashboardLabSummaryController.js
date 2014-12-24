'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardLabSummaryController', ['$scope', '$stateParams', 'clinicalAppConfigService',
        function ($scope, $stateParams, clinicalAppConfigService) {

            $scope.summaryPageParams = clinicalAppConfigService
                .getPatientDashBoardSectionByName("labOrders")
                .summaryPageParams || {};
            $scope.summaryPageParams.patientUuid = $stateParams.patientUuid
        }]);