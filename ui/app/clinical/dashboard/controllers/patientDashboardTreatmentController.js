'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$scope', 'ngDialog',
        function ($scope, ngDialog) {
            var treatmentConfigParams = $scope.dashboard.getSectionByType("treatment") || {};
            var patientUuidparams = {"patientUuid": $scope.patient.uuid};

            $scope.dashboardConfig = {};
            $scope.expandedViewConfig = {};

            _.extend($scope.dashboardConfig, treatmentConfigParams.dashboardConfig || {}, patientUuidparams);
            _.extend($scope.expandedViewConfig, treatmentConfigParams.expandedViewConfig || {}, patientUuidparams);

            $scope.openSummaryDialog = function () {
                ngDialog.open({
                    template: 'dashboard/views/dashboardSections/treatmentSummary.html',
                    params: $scope.expandedViewConfig,
                    className: "ngdialog-theme-default ng-dialog-all-details-page",
                    scope: $scope
                });
            };
            var cleanUpListener = $scope.$on('ngDialog.closing', function () {
                $("body").removeClass('ngdialog-open');
            });

            $scope.$on("$destroy", cleanUpListener);
        }]);
