'use strict';

angular.module('bahmni.clinical')
    .controller('LatestPrescriptionPrintController', ['$scope', 'visitActionsService', 'messagingService', 'TreatmentService',
        function ($scope, visitActionsService, messagingService, treatmentService) {
            var print = function (drugOrders, visitStartDate) {
                visitActionsService.printPrescription($scope.patient, drugOrders, visitStartDate);
                messagingService.showMessage("info", "Please close this tab.");
            };

            if ($scope.visitHistory.activeVisit) {
                treatmentService.getPrescribedAndActiveDrugOrders($scope.patient.uuid, null,
                    false, [$scope.visitHistory.activeVisit.uuid]).then(function (response) {
                        print(response.data.visitDrugOrders, $scope.visitHistory.activeVisit.startDatetime)
                    });
            } else {
                messagingService.showMessage("error", "No Active visit found for this patient.");
            }
        }]);