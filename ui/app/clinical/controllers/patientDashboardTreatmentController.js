angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$q', '$scope', '$stateParams', 'TreatmentService', 'spinner','clinicalConfigService', function ($q, $scope, $stateParams, treatmentService, spinner, clinicalConfigService) {
        $scope.drugOrderSections = {
            "active": {displayName: "Active Prescription", orders: null},
            "past": {displayName: "Last Prescription", orders: null}
        };
        var dateCompare = function (drugOrder1, drugOrder2) {
            return drugOrder1.effectiveStartDate > drugOrder2.effectiveStartDate? -1: 1;
        };

        $scope.isSectionNeeded = function (key){
            var isActiveNeeded = true;
            if(key == "active") {
                var patientDashBoardSectionFromConfig = clinicalConfigService.getAllPatientDashboardSections();
                patientDashBoardSectionFromConfig.forEach(function (section) {
                    if (section.title == "Treatments") {
                        isActiveNeeded = section.active || false;
                        return ;
                    }
                });
            }
            return isActiveNeeded;
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
