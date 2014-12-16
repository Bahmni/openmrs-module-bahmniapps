'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardLabSummaryController', ['$scope', '$stateParams', 'clinicalConfigService',
        function ($scope, $stateParams, clinicalConfigService) {

            $scope.summaryPageParams = clinicalConfigService
                .getPatientDashBoardSectionByName("labOrders")
                .summaryPageParams || {};
            $scope.summaryPageParams.patientUuid = $stateParams.patientUuid
        }]);