'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$scope', 'ngDialog',
        function ($scope, ngDialog) {

            var treatmentConfigParams = $scope.dashboardConfig.getSectionByName("treatment") || {};
            var patientUuidparams = {"patientUuid": $scope.patient.uuid};

            $scope.dashboardParams = {};
            $scope.summaryPageParams = {};

            _.extend($scope.dashboardParams, treatmentConfigParams.dashboardParams || {}, patientUuidparams);
            _.extend($scope.summaryPageParams, treatmentConfigParams.summaryPageParams || {}, patientUuidparams);

            $scope.openSummaryDialog = function () {
                ngDialog.open({
                    template: 'dashboard/views/dashboardSections/treatmentSummary.html',
                    params: $scope.summaryPageParams,
                    className: "ngdialog-theme-flat ngdialog-theme-custom",
                    scope: $scope
                });
            };

        }]);