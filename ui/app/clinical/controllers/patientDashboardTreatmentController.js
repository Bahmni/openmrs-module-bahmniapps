angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$q', '$scope', '$stateParams', 'TreatmentService', 'spinner','appService', function ($q, $scope, $stateParams, treatmentService, spinner, appService) {
        $scope.drugOrderSections = appService.getAppDescriptor().getConfigValue("treatmentSection") || {};

        var dateCompare = function (drugOrder1, drugOrder2) {
            return drugOrder1.effectiveStartDate > drugOrder2.effectiveStartDate? -1: 1;
        };

        $scope.isSectionNeeded = function (key){
            return $scope.drugOrderSections[key].isNeeded != undefined ? $scope.drugOrderSections[key].isNeeded : true ;
        }


        var getActiveDrugOrders = function() {
            return treatmentService.getActiveDrugOrders($stateParams.patientUuid).then(function (drugOrders) {
                var prescribedDrugOrders = [];
                drugOrders.forEach(function(drugOrder){
                    prescribedDrugOrders.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder))
                });
                $scope.drugOrderSections.active.orders = prescribedDrugOrders.sort(dateCompare);
            });
        };

        var getLastPrescribedDrugOrders = function() {
            var numberOfVisits = $scope.section.numberOfVisits || 1;
            return treatmentService.getPrescribedDrugOrders($stateParams.patientUuid, false, numberOfVisits).then(function (drugOrders) {
                var prescribedDrugOrders = [];
                drugOrders.forEach(function(drugOrder){
                    prescribedDrugOrders.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder))
                });
                $scope.drugOrderSections.past.orders = prescribedDrugOrders.sort(dateCompare);
            });
        };



        spinner.forPromise($q.all([getActiveDrugOrders(), getLastPrescribedDrugOrders()]));

    }]).controller('PatientDashboardAllTreatmentController', ['$scope', '$stateParams', 'TreatmentService', 'spinner', function($scope, $stateParams, treatmentService, spinner) {
        var init = function(){
            return treatmentService.getPrescribedDrugOrders($stateParams.patientUuid, true).then(function(drugOrders){
                var dateUtil = Bahmni.Common.Util.DateUtil;
                var prescribedDrugOrders = [];
                drugOrders.forEach(function(drugOrder){
                    prescribedDrugOrders.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder))
                });
                $scope.allTreatments = new Bahmni.Clinical.ResultGrouper().group(prescribedDrugOrders, function(prescribedDrugOrder){
                    return dateUtil.getDate(prescribedDrugOrder.effectiveStartDate);
                });
            });
        };

        spinner.forPromise(init());
    }]);
