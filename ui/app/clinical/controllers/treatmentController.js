'use strict';

angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', '$rootScope', 'TreatmentService', 'contextChangeHandler', 'RegisterTabService', 'treatmentConfig', 'DrugService', '$filter',
        function ($scope, $rootScope, treatmentService, contextChangeHandler, registerTabService, treatmentConfig, drugService, $filter) {

            $scope.treatments = $rootScope.newlyAddedTreatments || [];
            $scope.treatmentConfig = treatmentConfig;
            $scope.treatmentConfig.durationUnits = [
                {name: "Hour(s)", factor: 1/24},
                {name: "Day(s)", factor: 1},
                {name: "Week(s)", factor: 7},
                {name: "Month(s)", factor: 30}
            ];

            var newTreatment = function () {
                return new Bahmni.Clinical.DrugOrderViewModel($scope.currentBoard.extensionParams, $scope.treatmentConfig);
            };

            $scope.treatment = newTreatment();
            $scope.treatment.scheduledDate = $filter("date")($scope.treatment.scheduledDate, 'yyyy-MM-dd');

            var watchFunctionForQuantity = function() {
                var treatment = $scope.treatment;
                return {
                    uniformDosingType: treatment.uniformDosingType,
                    variableDosingType: treatment.variableDosingType,
                    duration: treatment.duration,
                    durationUnit: treatment.durationUnit
                }
            };

            $scope.$watch(watchFunctionForQuantity, function() {
                $scope.treatment.calculateQuantityAndUnit();
            }, true);

            $scope.add = function () {
                if ($scope.addForm.$invalid) {
                    $scope.formInvalid = true;
                    return;
                }
                $scope.treatment.dosingInstructionType = Bahmni.Clinical.Constants.flexibleDosingInstructionsClass;
                $scope.treatments.push($scope.treatment);
                $scope.treatment = newTreatment();
                $scope.treatment.scheduledDate = $filter("date")($scope.treatment.scheduledDate, 'yyyy-MM-dd');
                $scope.formInvalid = false;
            };

            $scope.remove = function (index) {
                $scope.treatments.splice(index, 1);
            };

            $scope.required = function(frequencyType) {
                var treatment = $scope.treatment;
                return treatment.frequencyType === frequencyType && !treatment.isCurrentDosingTypeEmpty();
            };

            $scope.toggleShowAdditionalInstructions = function (line) {
                line.showAdditionalInstructions = !line.showAdditionalInstructions;
            };

            $scope.toggleAsNeeded = function(treatment) {
                treatment.asNeeded = !treatment.asNeeded;
            };

            $scope.edit = function (index) {
                $scope.treatment = $scope.treatments[index];
                $scope.treatments.splice(index, 1);
            };

            var allowContextChange = function () {
                $rootScope.newlyAddedTreatments = $scope.treatments;
                return true;
            };

            $scope.getDrugs = function (request) {
                return drugService.search(request.term);
            };

            var constructDrugNameDisplay = function (drug, drugForm) {
                return {
                    label: drug.name + " (" + drugForm + ")",
                    value: drug.name + " (" + drugForm + ")",
                    drug: drug
                };
            };

            $scope.getDataResults = function (data) {
                return data.map(function (drug) {
                    return constructDrugNameDisplay(drug, drug.dosageForm.display)
                });
            };

            $scope.populateBackingFields = function(item) {
                $scope.treatment.drugName = item.drug.name;
            };

            contextChangeHandler.add(allowContextChange);

            var saveTreatment = function () {
                $rootScope.consultation.drugOrders = [];
                $rootScope.newlyAddedTreatments.forEach(function (treatment) {
                    $rootScope.consultation.drugOrders.push(Bahmni.Clinical.DrugOrder.createFromUIObject(treatment));
                });
            };
            registerTabService.register(saveTreatment);

            $rootScope.$on("event:reviseDrugOrder", function(event, drugOrder){
                $scope.treatment = drugOrder.revise(treatmentConfig);
                $scope.treatment.scheduledDate = $filter("date")($scope.treatment.scheduledDate, 'yyyy-MM-dd');
            });
        }]);
