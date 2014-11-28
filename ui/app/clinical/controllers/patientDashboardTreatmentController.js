angular.module('bahmni.clinical')
    .controller('PatientDashboardTreatmentController', ['$q', '$scope', '$stateParams', 'TreatmentService', 'spinner', 'clinicalConfigService', function ($q, $scope, $stateParams, treatmentService, spinner, clinicalConfigService) {
        $scope.drugOrderSections = {
            "active": {displayName: "Active Prescription", orders: null},
            "past": {displayName: "Last Prescription", orders: null}
        };

        var isActiveNeeded = clinicalConfigService.getPatientDashBoardSectionByName("treatment").active;

        var dateCompare = function (drugOrder1, drugOrder2) {
            return drugOrder1.effectiveStartDate > drugOrder2.effectiveStartDate ? -1 : 1;
        };
        var getActiveDrugOrders = function () {
            return treatmentService.getActiveDrugOrders($stateParams.patientUuid).then(function (drugOrders) {
                var prescribedDrugOrders = [];
                drugOrders.forEach(function (drugOrder) {
                    prescribedDrugOrders.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder))
                });
                $scope.drugOrderSections.active.orders = prescribedDrugOrders.sort(dateCompare);
            });
        };

        var getLastPrescribedDrugOrders = function () {
            var numberOfVisits = $scope.section.numberOfVisits || 1;
            return treatmentService.getPrescribedDrugOrders($stateParams.patientUuid, false, numberOfVisits).then(function (drugOrders) {
                var prescribedDrugOrders = [];
                drugOrders.forEach(function (drugOrder) {
                    prescribedDrugOrders.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder))
                });
                $scope.drugOrderSections.past.orders = prescribedDrugOrders.sort(dateCompare);
            });
        };

        $scope.isSectionNeeded = function (key) {
            if (key !== "active") return true;
            return isActiveNeeded;
        };

        var getPromises = function () {
            var promises = [getLastPrescribedDrugOrders()];
            if (isActiveNeeded) {
                promises.push(getActiveDrugOrders());
            }
            return promises;
        };

        spinner.forPromise($q.all(getPromises()));

    }]).controller('PatientDashboardAllTreatmentController', ['$scope', '$stateParams', 'TreatmentService', 'spinner', function ($scope, $stateParams, treatmentService, spinner) {
        var init = function () {
            return treatmentService.getPrescribedDrugOrders($stateParams.patientUuid, true).then(function (drugOrders) {
                var dateUtil = Bahmni.Common.Util.DateUtil;
                var prescribedDrugOrders = [];
                drugOrders.forEach(function (drugOrder) {
                    prescribedDrugOrders.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder))
                });
                $scope.allTreatments = new Bahmni.Clinical.ResultGrouper().group(prescribedDrugOrders, function (prescribedDrugOrder) {
                    return dateUtil.getDate(prescribedDrugOrder.effectiveStartDate);
                });
            });
        };

        spinner.forPromise(init());
    }]);
