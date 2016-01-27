'use strict';

angular.module('bahmni.common.displaycontrol.prescription')
    .directive('prescription', ['TreatmentService','treatmentConfig', '$q',
        function (treatmentService, treatmentConfig, $q) {
            var controller = function ($scope) {
                $q.all([treatmentConfig(), treatmentService.getPrescribedAndActiveDrugOrders($scope.patient.uuid, 1, false, [$scope.visitUuid],"","","")]).then(function (results) {
                    var treatmentConfig = results[0];
                    var drugOrderResponse = results[1].data;
                    var createDrugOrderViewModel = function (drugOrder) {
                        return Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, treatmentConfig);
                    };
                    for (var key in drugOrderResponse) {
                        drugOrderResponse[key] = drugOrderResponse[key].map(createDrugOrderViewModel);
                    }
                    var drugUtil = Bahmni.Clinical.DrugOrder.Util;
                    $scope.drugOrders = drugUtil.sortDrugOrders(drugOrderResponse.visitDrugOrders);
                });

            };
            return {
                restrict: 'EA',
                controller: controller,
                templateUrl: "../common/displaycontrols/prescription/views/prescription.html",
                scope: {
                    patient: "=",
                    visitDate: "=",
                    visitUuid: "="
                }
            }
        }]);
