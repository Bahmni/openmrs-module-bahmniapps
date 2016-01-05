'use strict';

angular.module('bahmni.clinical')

    .controller('TreatmentController', ['$scope', '$rootScope', 'contextChangeHandler', 'treatmentConfig', 'DrugService', '$timeout', 'orderSetService',
        'clinicalAppConfigService','ngDialog', '$window', 'spinner',
        function ($scope, $rootScope, contextChangeHandler, treatmentConfig, drugService, $timeout, orderSetService,
                  clinicalAppConfigService, ngDialog, $window, spinner) {

            var DateUtil = Bahmni.Common.Util.DateUtil;

            $scope.treatments = $scope.consultation.newlyAddedTreatments || [];
            $scope.treatmentConfig = treatmentConfig;
            $scope.treatmentActionLinks = clinicalAppConfigService.getTreatmentActionLink();
            var drugOrderAppConfig = clinicalAppConfigService.getDrugOrderConfig();


            function markVariable(variable){
                $scope[variable] = true;
                $timeout(function () {
                    $scope[variable] = false;
                });
            }
            function markEitherVariableDrugOrUniformDrug(drug){
                if(drug.isVariableDosingType()){
                    markVariable('editDrugEntryVariableFrequency');
                }
                else {
                    markVariable('editDrugEntryUniformFrequency');
                }
            }

            markVariable("startNewDrugEntry");

            var drugOrderHistory = null;

            var encounterDate = DateUtil.parse($scope.consultation.encounterDateTime);
            var newTreatment = function () {
                var newTreatment = new Bahmni.Clinical.DrugOrderViewModel(drugOrderAppConfig, $scope.treatmentConfig, null, encounterDate);
                newTreatment.isEditAllowed = false;
                return newTreatment;
            };

            $scope.minStartDate = encounterDate === null ? DateUtil.parse(Date.now()) : encounterDate;
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
                    doseUnits:treatment.doseUnits,
                    duration: treatment.duration,
                    durationUnit: treatment.durationUnit
                };
            };

            var isSameDrugBeingDiscontinuedAndOrdered = function(){
                var existingTreatment = false;
                angular.forEach($scope.consultation.discontinuedDrugs, function(drugOrder){
                    existingTreatment = _.some($scope.treatments, function (treatment) {
                        return treatment.getDrugName() === drugOrder.getDrugName();
                    }) && drugOrder.isMarkedForDiscontinue;
                });
                return existingTreatment;
            };

            var clearOtherDrugOrderActions = function(drugOrders) {
                drugOrders.forEach(function (drugOrder) {
                    drugOrder.isDiscontinuedAllowed = true;
                    drugOrder.isBeingEdited = false;
                });
            };

            $scope.$on("event:refillDrugOrder", function (event, drugOrder, alreadyActiveSimilarOrder) {
                var existingOrderStopDate = alreadyActiveSimilarOrder ? alreadyActiveSimilarOrder.effectiveStopDate : null;
                var refill = drugOrder.refill(existingOrderStopDate);
                drugOrderHistory = drugOrder;
                $scope.treatments.push(refill);
                markVariable("startNewDrugEntry");
            });

            $scope.$on("event:refillDrugOrders", function (event, drugOrders) {
                drugOrders.forEach(function (drugOrder) {
                    var refill = drugOrder.refill();
                    $scope.treatments.push(refill);
                });
            });

            $scope.$on("event:reviseDrugOrder", function (event, drugOrder, drugOrders) {
                clearOtherDrugOrderActions(drugOrders);
                drugOrder.isBeingEdited = true;
                drugOrder.isDiscontinuedAllowed = false;

                $scope.treatments.map(setIsNotBeingEdited);
                drugOrderHistory = drugOrder;
                $scope.treatment = drugOrder.revise();
                markEitherVariableDrugOrUniformDrug($scope.treatment);
                $scope.treatment.currentIndex = $scope.treatments.length + 1;
            });

            $scope.$watch(watchFunctionForQuantity, function () {
                $scope.treatment.calculateQuantityAndUnit();
            }, true);

            $scope.add = function () {
                $scope.treatment.dosingInstructionType = Bahmni.Clinical.Constants.flexibleDosingInstructionsClass;
                var newDrugOrder = $scope.treatment;
                newDrugOrder.effectiveStopDate = DateUtil
                    .addDays(
                    DateUtil.parse(newDrugOrder.effectiveStartDate), newDrugOrder.durationInDays);

                var unsavedNotBeingEditedOrders = $scope.treatments
                    .filter(function(drugOrder) { return drugOrder.isBeingEdited == false});

                var existingDrugOrders = newDrugOrder.isBeingEdited ?
                    $scope.consultation.activeAndScheduledDrugOrders
                        .filter(function (drugOrder) {
                            return drugOrder.uuid != newDrugOrder.previousOrderUuid
                        }).concat(unsavedNotBeingEditedOrders)
                    : $scope.consultation.activeAndScheduledDrugOrders.concat(unsavedNotBeingEditedOrders);

                if ($scope.treatment.isBeingEdited) {
                    $scope.treatments.splice($scope.treatment.currentIndex, 1);
                }

                var potentiallyOverlappingOrders = existingDrugOrders.filter(function (drugOrder) {
                    return (drugOrder.getDrugName() == newDrugOrder.getDrugName() && drugOrder.overlappingScheduledWith(newDrugOrder));
                });

                setEffectiveDates(newDrugOrder, potentiallyOverlappingOrders);


                var alreadyActiveSimilarOrders = existingDrugOrders.filter(function (drugOrder) {
                    return (drugOrder.getDrugName() == newDrugOrder.getDrugName() && drugOrder.overlappingScheduledWith(newDrugOrder));
                });

                if (alreadyActiveSimilarOrders.length > 0) {
                    $scope.alreadyActiveSimilarOrder = _.sortBy(potentiallyOverlappingOrders, 'effectiveStartDate').reverse()[0];
                    $scope.conflictingIndex = _.findIndex($scope.treatments, $scope.alreadyActiveSimilarOrder);
                    ngDialog.open({ template: 'consultation/views/treatmentSections/reviseRefillDrugOrderModal.html', scope: $scope});
                    $scope.popupActive = true;
                    return;
                }

                if ($scope.treatment.isBeingEdited) {
                    $scope.treatments.splice($scope.treatment.currentIndex, 0, $scope.treatment);
                    $scope.treatment.isBeingEdited = false;
                } else {
                    $scope.treatments.push($scope.treatment);
                }

                $scope.clearForm();
            };
            var setEffectiveDates = function (newDrugOrder, existingDrugOrders) {
                existingDrugOrders.forEach(function (existingDrugOrder) {
                    if (DateUtil.isSameDate(existingDrugOrder.effectiveStartDate, newDrugOrder.effectiveStopDate) && !DateUtil.isSameDate(existingDrugOrder.effectiveStopDate, newDrugOrder.effectiveStartDate)) {
                        if(!newDrugOrder.previousOrderUuid || newDrugOrder.previousOrderDurationInDays === newDrugOrder.durationInDays){
                            newDrugOrder.effectiveStopDate = DateUtil.subtractSeconds(existingDrugOrder.effectiveStartDate, 1);}
                        if(newDrugOrder.previousOrderUuid || DateUtil.isSameDate(newDrugOrder.effectiveStartDate,newDrugOrder.encounterDate)){
                            newDrugOrder.autoExpireDate = newDrugOrder.effectiveStopDate;
                        }
                    }
                    if (DateUtil.isSameDate(existingDrugOrder.effectiveStopDate, newDrugOrder.effectiveStartDate) && DateUtil.isSameDate(DateUtil.addSeconds(existingDrugOrder.effectiveStopDate, 1), newDrugOrder.effectiveStartDate)) { //compare date part only of datetime
                        if(!existingDrugOrder.uuid){
                            existingDrugOrder.effectiveStopDate = DateUtil.subtractSeconds(existingDrugOrder.effectiveStopDate, 1);
                        }
                        newDrugOrder.effectiveStartDate = DateUtil.addSeconds(existingDrugOrder.effectiveStopDate, 1);
                    }
                });
            };

            $scope.refill = function (drugOrder, alreadyActiveSimilarOrder) {
                $scope.popupActive = false;
                ngDialog.close();
                $scope.clearForm();
                $scope.$broadcast("event:refillDrugOrder", drugOrder, alreadyActiveSimilarOrder);
            };

            $scope.revise = function (drugOrder, index) {
                $scope.popupActive = false;
                ngDialog.close();
                if (drugOrder.uuid) {
                    $scope.$broadcast("event:reviseDrugOrder", drugOrder, $scope.consultation.activeAndScheduledDrugOrders);
                }
                else{
                    $scope.edit(index);
                }
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
                markEitherVariableDrugOrUniformDrug($scope.treatments[index]);
                $scope.treatments[index].isBeingEdited = true;
                $scope.treatment = $scope.treatments[index].cloneForEdit(index, drugOrderAppConfig, $scope.treatmentConfig);
            };

            $scope.incompleteDrugOrders = function(){
                var anyValuesFilled =  $scope.treatment.drug || $scope.treatment.uniformDosingType.dose || $scope.treatment.uniformDosingType.frequency || $scope.treatment.variableDosingType.morningDose || $scope.treatment.variableDosingType.afternoonDose || $scope.treatment.variableDosingType.eveningDose || $scope.treatment.duration || $scope.treatment.quantity
                return (anyValuesFilled && $scope.addForm.$invalid);
            };
            $scope.unaddedDrugOrders = function () {
                return $scope.addForm.$valid;
            };

            var contextChange = function () {
                var errorMessages = Bahmni.Clinical.Constants.errorMessages;
                if(isSameDrugBeingDiscontinuedAndOrdered()) {
                    return {allow: false, errorMessage: errorMessages.discontinuingAndOrderingSameDrug};
                }
                if($scope.incompleteDrugOrders()){
                    $scope.formInvalid = true;
                    return {allow: false};
                }
                if($scope.unaddedDrugOrders()){
                    return {allow: false, errorMessage: errorMessages.incompleteForm};
                }
                var valid = _.every($scope.treatments, function(drugOrder){
                    return drugOrder.validate();
                });
                if (!valid) {
                    return {allow: false, errorMessage: errorMessages.invalidItems};
                }
                $scope.consultation.newlyAddedTreatments = $scope.treatments || [];
                $scope.consultation.incompleteTreatment = $scope.treatment;
                return {allow: true};
            };

            $scope.remove = function (index) {
                $scope.treatments.splice(index, 1);
            };

            $scope.getDrugs = function (request) {
                return drugService.search(request.term);
            };

            var setIsNotBeingEdited = function (treatment) {
                treatment.isBeingEdited = false;
                return treatment;
            };

            var constructDrugNameDisplay = function (drug) {
                var drugSearchResult = new Bahmni.Clinical.DrugSearchResult(drug, $scope.treatment.drugNameDisplay);
                return {
                    label: drugSearchResult.getLabel(),
                    value: drugSearchResult.getValue(),
                    drug: drug
                };
            };

            $scope.getDataResults = function (data) {
                return data.map(constructDrugNameDisplay);
            };

            $scope.populateBackingFields = function (item) {
                $scope.treatment.changeDrug({
                    name: item.drug.name,
                    form: item.drug.dosageForm.display,
                    uuid: item.drug.uuid,
                    conceptUuid: item.drug.concept.uuid
                });
            };

            $scope.$watch("treatment.drug",
                function(newValue, oldValue) {
                    if(newValue) {
                        spinner.forPromise(orderSetService.getOrderSetWithAttributeNameAndValue(newValue.conceptUuid, "Primary", "true").then(function(response) {
                            $scope.orderSets = filterOutVoidedOrderSet(response.data.results);
                        }));
                        //spinner.forPromise(orderSetService.getUniqueOrderSetMembersWithoutPrimaryConcept(newValue.conceptUuid, "Primary", "true").then(function(response){
                        //    $scope.orderSetMembers = response;
                        //}))
                    }
                }
            );

            var filterOutVoidedOrderSet = function (orderSetResults) {
                _.forEach(orderSetResults, function(orderSetResult) {
                    orderSetResult.orderSetMembers = _.filter(orderSetResult.orderSetMembers, function (orderSetMemberObj) {
                        return !orderSetMemberObj.voided;
                    });
                });
                return orderSetResults;
            };

            $scope.clearForm = function () {
                $scope.treatment = newTreatment();
                $scope.formInvalid = false;
                clearHighlights();
                markVariable("startNewDrugEntry");
            };

            $scope.openActionLink = function (extension) {
                var url = extension.url.replace("{{patient_ref}}", $scope.patient.identifier);
                $window.open(url, "_blank");
            };

            $scope.toggleTabIndexWithinModal = function(event){
                var buttonsToFocusOn = ["modal-revise-button", "modal-refill-button"];
                var focusedButton = event.target;
                focusedButton.tabIndex = 1;

                buttonsToFocusOn.splice(buttonsToFocusOn.indexOf(focusedButton.id),1);
                var otherButton = buttonsToFocusOn[0];
                $("#"+otherButton)[0].tabIndex = 2;
            };

            $scope.toggleDrugOrderAttribute = function(orderAttribute){
                orderAttribute.value = orderAttribute.value ? false : true;
            };
            contextChangeHandler.add(contextChange);

            var defaultBulkDuration = function() {
                return {
                    bulkDurationUnit : treatmentConfig.durationUnits ? treatmentConfig.durationUnits[0].name : ""
                };
            };

            var clearBulkDurationChange = function() {
                $scope.bulkDurationData = defaultBulkDuration();
                $scope.bulkSelectCheckbox = false;
            };

            $scope.bulkDurationData = defaultBulkDuration();

            $scope.bulkChangeDuration = function() {
                $scope.showBulkChangeToggle = !$scope.showBulkChangeToggle;
                clearBulkDurationChange();
                $scope.selectAllCheckbox();
            };

            $scope.selectAllCheckbox = function(){
                $scope.bulkSelectCheckbox = !$scope.bulkSelectCheckbox;
                $scope.treatments.forEach(function (treatment) {
                    treatment.durationUpdateFlag = $scope.bulkSelectCheckbox;
                });
            };

            $scope.bulkDurationChangeDone = function() {
                if($scope.bulkDurationData.bulkDuration && $scope.bulkDurationData.bulkDurationUnit){
                    $scope.treatments.forEach(function (treatment) {
                        if(treatment.durationUpdateFlag){
                            treatment.duration = $scope.bulkDurationData.bulkDuration;
                            treatment.durationUnit = $scope.bulkDurationData.bulkDurationUnit;
                            treatment.calculateDurationInDays();
                            treatment.calculateQuantityAndUnit();
                        }
                    });
                }
                clearBulkDurationChange();
                $scope.bulkChangeDuration();
            };

            $scope.updateDuration = function(stepperValue) {
                if(!$scope.bulkDurationData.bulkDuration && isNaN($scope.bulkDurationData.bulkDuration)){
                    $scope.bulkDurationData.bulkDuration = 0
                }
                $scope.bulkDurationData.bulkDuration += stepperValue;
            };

            //ToDo :: When regimen orderSet is implemented use the below method :: For now we are hard codding the JSON

            var dummyResult = {name: "Paracetamol 120mg/5ml", form: "Syrup", uuid: "28d067a3-7e40-4331-9452-bd6b0e9bf201", conceptUuid: "4750370f-ad8e-49c5-80d2-b2136f59c3e9",
                "dose": 1.0,"doseUnits":"Tablet(s)","frequency":"Once a day","duration":4,"route": "Oral"};

            $scope.addOrderSetDrugs = function() {
                var treatment = newTreatment();
                treatment.uniformDosingType = {dose: dummyResult.dose, doseUnits: dummyResult.doseUnits, frequency: dummyResult.frequency};
                treatment.duration = dummyResult.duration;
                treatment.route = dummyResult.route;
                treatment.drug = {name: dummyResult.name, form: dummyResult.form, uuid: dummyResult.uuid, conceptUuid: dummyResult.conceptUuid};
                treatment.drugNameDisplay = dummyResult.name ? dummyResult.name + "(" + dummyResult.form + ")" : dummyResult.name;
                treatment.orderSetUuid = "832ea186-b9cb-45d2-bd24-ace7420dfa3b";
                treatment.sortWeight = 1;
                treatment.calculateQuantityAndUnit();
                $scope.treatments.push(treatment);

            };

        }]);
