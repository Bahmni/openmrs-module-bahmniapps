'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardDrugOrderDetailsController', ['$scope',
        function ($scope) {

            var treatmentConfigParams = $scope.dashboard.getSectionByName("drugOrderDetails") || {};
            var patientUuidparams = {"patientUuid": $scope.patient.uuid};

            $scope.dashboardParams = {};

            _.extend($scope.dashboardParams, treatmentConfigParams.dashboardParams || {}, patientUuidparams);

        }]);