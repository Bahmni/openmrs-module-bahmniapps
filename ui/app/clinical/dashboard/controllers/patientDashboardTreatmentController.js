'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$scope', '$rootScope', 'ngDialog', 'visitActionsService', 'treatmentService',
        function ($scope, $rootScope, ngDialog, visitActionsService, treatmentService) {
            var treatmentConfigParams = $scope.dashboard.getSectionByType("treatment") || {};
            $scope.isEmailPresent = $scope.patient.email ? true : false;
            var patientParams = {"patientUuid": $scope.patient.uuid, "isEmailPresent": $scope.isEmailPresent};
            var printParams = treatmentConfigParams.prescriptionPrint || {};
            printParams.locationName = $rootScope.locationName;
            printParams.locationAddress = $rootScope.locationAddress;

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

            $scope.$on("event:sharePrescriptionsViaEmail", function (event, visitStartDate, visitUuid) {
                treatmentService.sharePrescriptions({patient: $scope.patient, visitDate: visitStartDate, visitUuid: visitUuid, printParams: printParams});
            });

            $scope.$on("event:downloadPrescriptionFromDashboard", function (event, visitStartDate, visitUuid) {
                visitActionsService.printPrescription($scope.patient, visitStartDate, visitUuid, printParams);
            });

            var cleanUpListener = $scope.$on('ngDialog.closing', function () {
                $("body").removeClass('ngdialog-open');
            });

            $scope.$on("$destroy", cleanUpListener);
        }]);
