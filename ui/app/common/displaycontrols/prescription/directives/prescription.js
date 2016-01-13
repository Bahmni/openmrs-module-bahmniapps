'use strict';

angular.module('bahmni.common.displaycontrol.prescription')
    .directive('prescription', ['TreatmentService', 'clinicalAppConfigService',
        function (treatmentService, clinicalAppConfigService) {
            var controller = function ($scope, clinicalAppConfigService) {
                console.log(clinicalAppConfigService.getDrugOrderConfig());
                treatmentService.getPrescribedAndActiveDrugOrders($scope.patient.uuid, 1, false, [$scope.visitUuid],"","","", clinicalAppConfigService.getDrugOrderConfig()).then(function (response) {
                    var drugUtil = Bahmni.Clinical.DrugOrder.Util;
                    $scope.drugOrders = drugUtil.sortDrugOrders(response.data.visitDrugOrders);
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
