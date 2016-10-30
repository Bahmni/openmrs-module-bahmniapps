'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardLabSummaryController', ['$scope', '$stateParams',
        function ($scope, $stateParams) {
            $scope.expandedViewConfig = $scope.ngDialogData.expandedViewConfig;
            $scope.expandedViewConfig.patientUuid = $stateParams.patientUuid;

            $scope.patient = $scope.ngDialogData.patient;
        }]);
