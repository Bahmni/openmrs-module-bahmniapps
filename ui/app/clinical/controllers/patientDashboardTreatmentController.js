angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$scope', '$stateParams', 'TreatmentService', 'spinner', function ($scope, $stateParams, treatmentService, spinner) {

        var dateCompare = function (drugOrder1, drugOrder2) {
            return drugOrder1.orderDate > drugOrder2.orderDate? -1: 1;
        };
        spinner.forPromise(treatmentService.getActiveDrugOrders($stateParams.patientUuid).then(function (drugOrders) {
            $scope.drugOrders = drugOrders.sort(dateCompare);
        }));
    }]);