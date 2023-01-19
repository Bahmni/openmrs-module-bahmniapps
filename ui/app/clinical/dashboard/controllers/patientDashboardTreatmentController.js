'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$scope', 'ngDialog', 'visitActionsService',
        function ($scope, ngDialog, visitActionsService) {
            var treatmentConfigParams = $scope.dashboard.getSectionByType("treatment") || {};
            $scope.isEmailPresent = $scope.patient.email ? true : false;
            $scope.isPhoneNumberPresent = $scope.patient.phoneNumber ? true : false;
            var patientParams = {"patientUuid": $scope.patient.uuid, "isEmailPresent": $scope.isEmailPresent, "isPhoneNumberPresent": $scope.isPhoneNumberPresent};
            

            $scope.dashboardConfig = {};
            $scope.expandedViewConfig = {};

            _.extend($scope.dashboardConfig, treatmentConfigParams.dashboardConfig || {}, patientParams);
            _.extend($scope.expandedViewConfig, treatmentConfigParams.expandedViewConfig || {}, patientParams);

            $scope.openSummaryDialog = function () {
                ngDialog.open({
                    template: 'dashboard/views/dashboardSections/treatmentSummary.html',
                    params: $scope.expandedViewConfig,
                    className: "ngdialog-theme-default ng-dialog-all-details-page",
                    scope: $scope
                });
            };

            $scope.$on("event:downloadPrescriptionFromDashboard", function (event, visitStartDate, visitUuid) {
                visitActionsService.printPrescription($scope.patient, visitStartDate, visitUuid);
            });

            var cleanUpListener = $scope.$on('ngDialog.closing', function () {
                $("body").removeClass('ngdialog-open');
            });

            $scope.$on("$destroy", cleanUpListener);
        }]);
