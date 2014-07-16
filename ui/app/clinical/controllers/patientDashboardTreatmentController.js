angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$q', '$scope', '$stateParams', 'TreatmentService', 'spinner', function ($q, $scope, $stateParams, treatmentService, spinner) {
        $scope.drugOrderSections = {
            "active": {displayName: "Active Prescription", orders: null},
            "past": {displayName: "Last Prescription", orders: null},
        };

        var dateCompare = function (drugOrder1, drugOrder2) {
            return drugOrder1.orderDate > drugOrder2.orderDate? -1: 1;
        };

        var getActiveDrugOrders = function() {
            return treatmentService.getActiveDrugOrders($stateParams.patientUuid).then(function (drugOrders) {
                $scope.drugOrderSections.active.orders = drugOrders.sort(dateCompare);
            });
        };

        var getLastPrescribedDrugOrders = function() {
            var numberOfVisits = $scope.section.numberOfVisits || 1;
            return treatmentService.getPrescribedDrugOrders($stateParams.patientUuid, false, numberOfVisits).then(function (drugOrders) {
                $scope.drugOrderSections.past.orders = drugOrders.sort(dateCompare);
            });
        };

        spinner.forPromise($q.all([getActiveDrugOrders(), getLastPrescribedDrugOrders()]));

    }]).controller('PatientDashboardAllTreatmentController', ['$scope', '$stateParams', 'TreatmentService', 'spinner', function($scope, $stateParams, treatmentService, spinner) {
        var init = function(){
            return treatmentService.getPrescribedDrugOrders($stateParams.patientUuid, true).then(function(results){
                var dateUtil = Bahmni.Common.Util.DateUtil;
                $scope.allTreatments = new Bahmni.Clinical.ResultGrouper().group(results, function(drugOrder){
                    return dateUtil.getDate(drugOrder.orderDate);
                });
            });
        };

        spinner.forPromise(init());
    }]);
