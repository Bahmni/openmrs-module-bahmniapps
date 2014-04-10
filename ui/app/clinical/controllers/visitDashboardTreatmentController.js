angular.module('bahmni.clinical')
    .controller('VisitDashboardTreatmentController', ['$scope', '$stateParams', 'TreatmentService', function ($scope, $stateParams, treatmentService) {

        treatmentService.getActiveDrugOrders($stateParams.patientUuid).then(function (drugOrders) {
            $scope.drugOrders = drugOrders;
        });
    }]);