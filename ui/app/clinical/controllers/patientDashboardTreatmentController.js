angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$scope', '$stateParams', 'TreatmentService', function ($scope, $stateParams, treatmentService) {

        var dateCompare = function (drugOrder1, drugOrder2) {
            return drugOrder1.orderDate > drugOrder2.orderDate? -1: 1;
        };
        treatmentService.getActiveDrugOrders($stateParams.patientUuid).then(function (drugOrders) {
            $scope.drugOrders = drugOrders.sort(dateCompare);

        });
    }]);