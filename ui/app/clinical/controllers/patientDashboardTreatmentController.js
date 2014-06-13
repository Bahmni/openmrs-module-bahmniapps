angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$q', '$scope', '$stateParams', 'TreatmentService', 'spinner', function ($q, $scope, $stateParams, treatmentService, spinner) {
        $scope.drugOrderSections = {
            "active": {displayName: "Active Treatment", orders: null},
            "past": {displayName: "Past Treatment", orders: null},
        }

        var dateCompare = function (drugOrder1, drugOrder2) {
            return drugOrder1.orderDate > drugOrder2.orderDate? -1: 1;
        };

        var getActiveDrugOrders = function() {
            return treatmentService.getActiveDrugOrders($stateParams.patientUuid).then(function (drugOrders) {
                $scope.drugOrderSections.active.orders = drugOrders.sort(dateCompare);
            });
        }

        var getLastPrescribedDrugOrders = function() {
            var now = new Date();
            var numberOfVisits = $scope.section.options && $scope.section.options.numberOfVisitsForPastTreatments || 2;
            return treatmentService.getPrescribedDrugOrders($stateParams.patientUuid, numberOfVisits).then(function (drugOrders) {
                $scope.drugOrderSections.past.orders = drugOrders.sort(dateCompare).filter(function(order) {
                    return order.expireDate == null || order.expireDate <=  now;
                });
            });
        }
        spinner.forPromise($q.all([getActiveDrugOrders(), getLastPrescribedDrugOrders()]));
    }]);