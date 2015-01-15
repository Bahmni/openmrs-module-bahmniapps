angular.module('bahmni.clinical')

    .controller('PatientDashboardTreatmentController', ['$q', '$scope', '$stateParams', 'TreatmentService', 'spinner', 'clinicalAppConfigService',
        function ($q, $scope, $stateParams, treatmentService, spinner, clinicalAppConfigService) {

            $scope.dashboardParams = clinicalAppConfigService
                .getPatientDashBoardSectionByName("treatment")
                .dashboardParams || {};

            $scope.dashboardParams.patientUuid = $stateParams.patientUuid;


            $scope.dialogData = {
                "patient": $scope.patient
            };

        }]).controller('PatientDashboardAllTreatmentController', ['$scope', '$stateParams', 'TreatmentService', 'spinner',
        function ($scope, $stateParams, treatmentService, spinner) {

            $scope.patient= $scope.ngDialogData.patient;

            var init = function () {
                return treatmentService.getPrescribedDrugOrders($stateParams.patientUuid, true).then(function (drugOrders) {
                    var dateUtil = Bahmni.Common.Util.DateUtil;
                    var prescribedDrugOrders = [];
                    drugOrders.forEach(function (drugOrder) {
                        prescribedDrugOrders.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder))
                    });
                    $scope.allTreatments = new Bahmni.Clinical.ResultGrouper().group(prescribedDrugOrders, function (prescribedDrugOrder) {
                        return dateUtil.getDate(prescribedDrugOrder.effectiveStartDate).toISOString();
                    });
                    $scope.allTreatments = _.sortBy($scope.allTreatments, 'key').reverse();
                });
            };

            spinner.forPromise(init());
        }]);
