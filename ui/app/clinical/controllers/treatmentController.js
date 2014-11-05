'use strict';

angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', '$rootScope', 'TreatmentService', 'contextChangeHandler', 'RegisterTabService', 'treatmentConfig', 'DrugService', '$timeout',
        function ($scope, $rootScope, treatmentService, contextChangeHandler, registerTabService, treatmentConfig, drugService, $timeout) {
            $scope.treatments = $scope.consultation.newlyAddedTreatments || [];
            $scope.treatmentConfig = treatmentConfig;
            function markStartingNewDrugEntry() {
                $scope.startNewDrugEntry = true;
                $timeout(function () {
                    $scope.startNewDrugEntry = false;
                });
            }

            markStartingNewDrugEntry();

            var drugOrderHistory = null;
            $scope.treatmentConfig.durationUnits = [
                {name: "Hour(s)", factor: 1 / 24},
                {name: "Day(s)", factor: 1},
                {name: "Week(s)", factor: 7},
                {name: "Month(s)", factor: 30}
            ];

            var newTreatment = function () {
                return new Bahmni.Clinical.DrugOrderViewModel($scope.currentBoard.extensionParams, $scope.treatmentConfig);
            };

            $scope.today = new Date();

            $scope.treatment = $scope.consultation.incompleteTreatment || newTreatment();
            $scope.treatmentConfig.durationUnits.forEach(function (durationUnit) {
                if (_.isEqual(durationUnit, $scope.treatment.durationUnit)) {
                    $scope.treatment.durationUnit = durationUnit;
                }
            });

            var watchFunctionForQuantity = function () {
                var treatment = $scope.treatment;
                return {
                    uniformDosingType: treatment.uniformDosingType,
                    variableDosingType: treatment.variableDosingType,
                    duration: treatment.duration,
                    durationUnit: treatment.durationUnit
                }
            };

            var restrictDrugsBeingDiscontinued = function(){
                var existingTreatment = false;
                angular.forEach($scope.consultation.discontinuedDrugs, function(drugOrder){
                    existingTreatment = _.some($scope.treatments, function (treatment) {
                        return treatment.drugName === drugOrder.drugName && drugOrder.isMarkedForDiscontinue;
                    });
                });
                return existingTreatment;
            };

            var refillDrugOrderEvent = $scope.$on("event:refillDrugOrder", function (event, drugOrder) {
                var refill = drugOrder.refill();
                drugOrderHistory = drugOrder;
                $scope.treatments.push(refill);
                markStartingNewDrugEntry();
            });

            var refillDrugOrdersEvent = $scope.$on("event:refillDrugOrders", function (event, drugOrders) {
                drugOrders.forEach(function (drugOrder) {
                    var refill = drugOrder.refill();
                    $scope.treatments.push(refill);
                })
            });

            var reviseDrugOrderEvent = $scope.$on("event:reviseDrugOrder", function (event, drugOrder) {
                $scope.treatments.map(setIsNotBeingEdited);
                drugOrderHistory = drugOrder;
                $scope.treatment = drugOrder.revise();
                $scope.treatment.currentIndex = $scope.treatments.length + 1;
            });

            $scope.$watch(watchFunctionForQuantity, function () {
                $scope.treatment.calculateQuantityAndUnit();
            }, true);

            $scope.add = function () {
                clearHighlights();
                $scope.treatment.dosingInstructionType = Bahmni.Clinical.Constants.flexibleDosingInstructionsClass;
                if($scope.treatment.isBeingEdited){
                    $scope.treatments.splice($scope.treatment.currentIndex,1);
                    $scope.treatment.isBeingEdited = false;
                }
                $scope.treatments.push($scope.treatment);
                $scope.treatment = newTreatment();
                markStartingNewDrugEntry();
            };

            $scope.remove = function (index) {
                $scope.treatments.splice(index, 1);
            };

            $scope.toggleShowAdditionalInstructions = function (line) {
                line.showAdditionalInstructions = !line.showAdditionalInstructions;
            };

            $scope.toggleAsNeeded = function (treatment) {
                treatment.asNeeded = !treatment.asNeeded;
            };

            var clearHighlights = function(){
                $scope.treatments.map(setIsNotBeingEdited);
                drugOrderHistory ? drugOrderHistory.isBeingEdited = false : null;
                drugOrderHistory ? drugOrderHistory.isDiscontinuedAllowed = true : null;
            };

            $scope.edit = function (index) {
                clearHighlights();
                $scope.treatments[index].isBeingEdited = true;
                $scope.treatment = $scope.treatments[index].cloneForEdit(index, $scope.currentBoard.extensionParams, $scope.treatmentConfig);
            };

            $scope.incompleteDrugOrders = function(){
                var anyValuesFilled =  $scope.treatment.drugName || $scope.treatment.uniformDosingType.dose || $scope.treatment.uniformDosingType.frequency || $scope.treatment.variableDosingType.morningDose || $scope.treatment.variableDosingType.afternoonDose || $scope.treatment.variableDosingType.eveningDose || $scope.treatment.duration || $scope.treatment.quantity
                return (anyValuesFilled && $scope.addForm.$invalid);
            };
            $scope.unaddedDrugOrders = function () {
                return $scope.addForm.$valid;
            };

            var contextChange = function () {
                if(restrictDrugsBeingDiscontinued()) {
                    return {allow: false, errorMessage: "Discontinuing and ordering the same drug is not allowed. Instead, use edit."};
                }
                if($scope.incompleteDrugOrders() == true){
                    $scope.formInvalid = true;
                    return {allow: false};
                }
                if($scope.unaddedDrugOrders() == true){
                    return {allow: false, errorMessage: "Please add the details of the drug form to New Prescription before clicking Save"};
                }
                $scope.consultation.newlyAddedTreatments = $scope.treatments;
                $scope.consultation.incompleteTreatment = $scope.treatment;
                return {allow: true};
            };

            $scope.getDrugs = function (request) {
                return drugService.search(request.term);
            };

            var setIsNotBeingEdited = function (treatment) {
                treatment.isBeingEdited = false;
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

            $scope.populateBackingFields = function (item) {
                $scope.treatment.drugName = item.drug.name;
            };

            $scope.clearForm = function () {
                $scope.treatment = newTreatment();
                clearHighlights();
                markStartingNewDrugEntry();
            };

            contextChangeHandler.add(contextChange);

            var saveTreatment = function () {
                $rootScope.consultation.drugOrders = [];
                $scope.consultation.newlyAddedTreatments.forEach(function (treatment) {
                    $rootScope.consultation.drugOrders.push(Bahmni.Clinical.DrugOrder.createFromUIObject(treatment));
                });
            };
            registerTabService.register(saveTreatment);

        }]);
