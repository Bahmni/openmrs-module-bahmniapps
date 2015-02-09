'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardLabSummaryController', ['$scope', '$stateParams',
        function ($scope, $stateParams) {

            $scope.allLabDetails = $scope.ngDialogData.allLabDetails;
            $scope.allLabDetails.patientUuid = $stateParams.patientUuid;

            $scope.patient = $scope.ngDialogData.patient;

        }]);