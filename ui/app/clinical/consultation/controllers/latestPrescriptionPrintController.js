'use strict';

angular.module('bahmni.clinical')
    .controller('LatestPrescriptionPrintController', ['$scope', 'visitActionsService', 'messagingService', 'TreatmentService', 'drugOrderHistoryHelper',
        function ($scope, visitActionsService, messagingService, treatmentService, drugOrderHistoryHelper) {
            var print = function (drugOrders, visitStartDate) {
                visitActionsService.printPrescription($scope.patient, drugOrders, visitStartDate);
                messagingService.showMessage("info", "Please close this tab.");
            };

            var createDrugOrderViewModel = function (drugOrder) {
                return Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, {}, undefined);
            };

            if ($scope.visitHistory.activeVisit) {
                treatmentService.getActiveDrugOrders($scope.patient.uuid).then(function (response) {
                    var drugOrder = drugOrderHistoryHelper.getRefillableDrugOrders(response.map(createDrugOrderViewModel));
                    print(drugOrder, $scope.visitHistory.activeVisit.startDatetime);
                });
            } else {
                messagingService.showMessage("error", "No Active visit found for this patient.");
            }
        }]);