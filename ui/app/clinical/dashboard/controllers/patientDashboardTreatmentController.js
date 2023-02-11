'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$scope', '$rootScope', 'ngDialog', 'visitActionsService',
        function ($scope, $rootScope, ngDialog, visitActionsService) {
            var treatmentConfigParams = $scope.dashboard.getSectionByType("treatment") || {};
            $scope.isEmailPresent = $scope.patient.email ? true : false;
            $scope.isPhoneNumberPresent = $scope.patient.phoneNumber ? true : false;
            var patientParams = {"patientUuid": $scope.patient.uuid, "isEmailPresent": $scope.isEmailPresent, "isPhoneNumberPresent": $scope.isPhoneNumberPresent};
            var sharePrescriptionToggles = {"prescriptionEmailToggle": $rootScope.prescriptionEmailToggle, "prescriptionSMSToggle": $rootScope.prescriptionSMSToggle};

            $scope.dashboardConfig = {};
            $scope.expandedViewConfig = {};

            _.extend($scope.dashboardConfig, treatmentConfigParams.dashboardConfig || {}, patientParams, sharePrescriptionToggles);
            _.extend($scope.expandedViewConfig, treatmentConfigParams.expandedViewConfig || {}, patientParams, sharePrescriptionToggles);

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
