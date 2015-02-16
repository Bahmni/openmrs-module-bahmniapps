'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$scope', 'ngDialog',
        function ($scope, ngDialog) {

            var treatmentConfigParams = $scope.dashboard.getSectionByName("treatment") || {};
            var patientUuidparams = {"patientUuid": $scope.patient.uuid};

            $scope.dashboardParams = {};
            $scope.allTreatmentDetails = {};

            _.extend($scope.dashboardParams, treatmentConfigParams.dashboardParams || {}, patientUuidparams);
            _.extend($scope.allTreatmentDetails, treatmentConfigParams.allTreatmentDetails || {}, patientUuidparams);

            $scope.openSummaryDialog = function () {
                ngDialog.open({
                    template: 'dashboard/views/dashboardSections/treatmentSummary.html',
                    params: $scope.allTreatmentDetails,
                    className: "ngdialog-theme-flat ngdialog-theme-custom",
                    scope: $scope
                });
            };

        }]);