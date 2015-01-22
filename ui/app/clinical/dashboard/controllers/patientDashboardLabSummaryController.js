'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardLabSummaryController', ['$scope', '$stateParams',
        function ($scope, $stateParams) {

            $scope.summaryPageParams = $scope.ngDialogData.summaryPageParams;
            $scope.summaryPageParams.patientUuid = $stateParams.patientUuid;

            $scope.patient = $scope.ngDialogData.patient;

        }]);