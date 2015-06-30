'use strict';

angular.module('bahmni.common.displaycontrol.prescription')
    .directive('prescription', ['TreatmentService',
        function (treatmentService) {
            var controller = function($scope) {
                treatmentService.getPrescribedAndActiveDrugOrders($scope.patient.uuid, 1, false, [$scope.visitUuid]).then(function (response) {
                    var drugUtil = Bahmni.Clinical.DrugOrder.Util;
                    $scope.drugOrders = drugUtil.sortDrugs(response.data.visitDrugOrders);
                });
            };
            return {
                restrict:'EA',
                controller: controller,
                templateUrl:"../common/displaycontrols/prescription/views/prescription.html",
                scope:{
                    patient:"=",
                    visitDate:"=",
                    visitUuid:"="
                }
            }
        }]);
