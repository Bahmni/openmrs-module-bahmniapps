angular.module('bahmni.clinical')

    .controller('PatientDashboardTreatmentController', ['$q', '$scope', '$stateParams', 'TreatmentService', 'spinner', 'ngDialog', 'clinicalAppConfigService',
        function ($q, $scope, $stateParams, treatmentService, spinner, ngDialog, clinicalAppConfigService) {

            var treatmentConfigParams = clinicalAppConfigService
                .getPatientDashBoardSectionByName("treatment") || {};

            var patientUuidparams = {"patientUuid": $scope.patient.uuid};

            $scope.dashboardParams = angular.extend(treatmentConfigParams.dashboardParams || {}, patientUuidparams);

            $scope.summaryPageParams = angular.extend(treatmentConfigParams.summaryPageParams || {}, patientUuidparams)


            $scope.openSummaryDialog = function(){
                    ngDialog.open({
                        template: 'dashboard/views/dashboardSections/treatmentSummary.html',
                        params: $scope.summaryPageParams,
                        className: "ngdialog-theme-flat ngdialog-theme-custom",
                        scope: $scope
                    });
            };

        }]);