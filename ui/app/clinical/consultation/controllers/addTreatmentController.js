'use strict';

angular.module('bahmni.clinical')

    .controller('AddTreatmentController', ['$scope', '$rootScope', 'contextChangeHandler', 'treatmentConfig', 'DrugService', '$timeout',
        'clinicalAppConfigService', 'ngDialog', '$window', 'messagingService', 'appService', 'activeDrugOrders',
        function ($scope, $rootScope, contextChangeHandler, treatmentConfig, drugService, $timeout,
                  clinicalAppConfigService, ngDialog, $window, messagingService, appService, activeDrugOrders) {

            var DateUtil = Bahmni.Common.Util.DateUtil;
            var DrugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel;

            $scope.treatmentActionLinks = clinicalAppConfigService.getTreatmentActionLink();

            var preFetchDrugsForGivenConceptSet = function () {
                drugService.getSetMembersOfConcept(treatmentConfig.getDrugConceptSet()).then(function (result) {
                    $scope.drugs = result.map(Bahmni.Clinical.DrugSearchResult.create);
                });
            };
            if(treatmentConfig.isDropDownForGivenConceptSet()) {
                preFetchDrugsForGivenConceptSet();
            }
            if(treatmentConfig.isAutoCompleteForAllConcepts()){
                $scope.getDrugs = function (request) {
                    return drugService.search(request.term);
                };
            }
            if(treatmentConfig.isAutoCompleteForGivenConceptSet()){
                $scope.getDrugs = function (request) {
                    return drugService.getSetMembersOfConcept(treatmentConfig.getDrugConceptSet(),request.term);
                };
            }

            $scope.doseFractions = treatmentConfig.getDoseFractions();
            $scope.showDoseFractions = treatmentConfig.inputOptionsConfig.showDoseFractions;
            $scope.isDoseFractionsAvailable = function() {
                return $scope.doseFractions && !_.isEmpty($scope.doseFractions) ? true : false;
            };

            $scope.isSelected = function(drug) {
                var selectedDrug = $scope.treatment.drug;
                return selectedDrug && drug.drug.name === selectedDrug.name;
            };

            $scope.selectFromDefaultDrugList = function() {
                $scope.onSelect($scope.treatment.selectedItem);
                $scope.onChange();
            };

            var markVariable = function (variable){
                $scope[variable] = true;
                $timeout(function () {
                    $scope[variable] = false;
                });
            };

            var markEitherVariableDrugOrUniformDrug = function(drug){
                if(drug.isVariableDosingType()){
                    markVariable('editDrugEntryVariableFrequency');
                }
                else {
                    markVariable('editDrugEntryUniformFrequency');
                }
            };

            markVariable("startNewDrugEntry");

            var setDrugOrderBeingEdited,clearHighlights;
            (function(){
                var drugOrderBeingEdited = null;

                setDrugOrderBeingEdited = function(drugOder){
                    drugOrderBeingEdited = drugOder;
                };

                clearHighlights = function(){
                    $scope.treatments.forEach(setIsNotBeingEdited);
                    if(drugOrderBeingEdited){
                        drugOrderBeingEdited.isBeingEdited = false;
                        drugOrderBeingEdited.isDiscontinuedAllowed = true;
                    }
                };
            })();

            var encounterDate = DateUtil.parse($scope.consultation.encounterDateTime);
            var newTreatment = function () {
                var newTreatment = new Bahmni.Clinical.DrugOrderViewModel(treatmentConfig, null, encounterDate);
                newTreatment.isEditAllowed = false;
                return newTreatment;
            };

            $scope.treatment = newTreatment();
            treatmentConfig.durationUnits.forEach(function (durationUnit) {
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

            var setNonCodedDrugConcept = function(treatment) {
                if (treatment.drugNonCoded) {
                    treatment.concept = treatmentConfig.nonCodedDrugconcept;
                }
            };

            $scope.$on("event:refillDrugOrder", function (event, drugOrder, alreadyActiveSimilarOrder) {
                $scope.bulkSelectCheckbox=false;
                var existingOrderStopDate = alreadyActiveSimilarOrder ? alreadyActiveSimilarOrder.effectiveStopDate : null;
                var refillDrugOrder = drugOrder.refill(existingOrderStopDate);
                setNonCodedDrugConcept(refillDrugOrder);
                setDrugOrderBeingEdited(drugOrder);
                $scope.treatments.push(refillDrugOrder);
                markVariable("startNewDrugEntry");
            });

            $scope.$on("event:refillDrugOrders", function (event, drugOrders) {
                $scope.bulkSelectCheckbox=false;
                drugOrders.forEach(function (drugOrder) {
                    setNonCodedDrugConcept(drugOrder);
                    if (drugOrder.effectiveStopDate) {
                        var refill = drugOrder.refill();
                        $scope.treatments.push(refill);
                    }
                });
            });

            $scope.$on("event:discontinueDrugOrder", function (event, drugOrder) {
                drugOrder.isMarkedForDiscontinue = true;
                drugOrder.isEditAllowed = false;
                drugOrder.dateStopped = DateUtil.now();
                $scope.consultation.discontinuedDrugs.push(drugOrder);
                $scope.minDateStopped = DateUtil.getDateWithoutTime(drugOrder.effectiveStartDate<DateUtil.now()?drugOrder.effectiveStartDate:DateUtil.now());
            });

            $scope.$on("event:undoDiscontinueDrugOrder", function (event, drugOrder) {
                $scope.consultation.discontinuedDrugs = _.reject($scope.consultation.discontinuedDrugs, function (removableOrder) {
                    return removableOrder.uuid === drugOrder.uuid;
                });
                $scope.consultation.removableDrugs = _.reject($scope.consultation.removableDrugs, function (removableOrder) {
                    return removableOrder.previousOrderUuid === drugOrder.uuid;
                });
                drugOrder.orderReasonConcept = null;
                drugOrder.dateStopped = null;
                drugOrder.orderReasonText=null;
                drugOrder.isMarkedForDiscontinue = false;
                drugOrder.isEditAllowed = true;
            });


            var selectDrugFromDropdown = function(drug_){
                if (treatmentConfig.isDropDownForGivenConceptSet()){
                    $scope.treatment.selectedItem = _.find($scope.drugs, function(drug){
                        return drug.drug.uuid === drug_.uuid
                    })
                }
            };

            $scope.$on("event:reviseDrugOrder", function (event, drugOrder, drugOrders) {
                clearOtherDrugOrderActions(drugOrders);
                drugOrder.isBeingEdited = true;
                drugOrder.isDiscontinuedAllowed = false;
                $scope.treatments.forEach(setIsNotBeingEdited);
                setDrugOrderBeingEdited(drugOrder);
                $scope.treatment = drugOrder.revise();
                selectDrugFromDropdown(drugOrder.drug);
                markEitherVariableDrugOrUniformDrug($scope.treatment);
                $scope.treatment.currentIndex = $scope.treatments.length + 1;
                if($scope.treatment.frequencyType == Bahmni.Clinical.Constants.dosingTypes.variable) {
                    $scope.treatment.isUniformFrequency = false;
                }
                $scope.treatment.quantity = $scope.treatment.quantity ? $scope.treatment.quantity : null;
            });

            $scope.$watch(watchFunctionForQuantity, function () {
                $scope.treatment.calculateQuantityAndUnit();
            }, true);

            $scope.add = function () {
                $scope.treatment.dosingInstructionType = Bahmni.Clinical.Constants.flexibleDosingInstructionsClass;
                if($scope.treatment.isNonCodedDrug) {
                    $scope.treatment.drugNonCoded = $scope.treatment.drugNameDisplay;
                }

                if ($scope.treatment.frequencyType === "uniform") {
                    $scope.treatment.setDose($scope.treatment.getDose());
                }

                var newDrugOrder = $scope.treatment;
                setNonCodedDrugConcept($scope.treatment);

                if(newDrugOrder.durationInDays) {
                    newDrugOrder.effectiveStopDate = DateUtil
                        .addDays(
                        DateUtil.parse(newDrugOrder.effectiveStartDate), newDrugOrder.durationInDays);
                }

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
                    ngDialog.open({ template: 'consultation/views/treatmentSections/conflictingDrugOrderModal.html', scope: $scope});
                    $scope.popupActive = true;
                    return;
                }

                if (!$scope.treatment.quantity) {
                    $scope.treatment.quantity = 0;
                }

                if ($scope.treatment.isBeingEdited) {
                    $scope.treatments.splice($scope.treatment.currentIndex, 0, $scope.treatment);
                    $scope.treatment.isBeingEdited = false;
                } else {
                    $scope.treatments.push($scope.treatment);
                }

                $scope.clearForm();

            };

            var isEffectiveStartDateSameAsToday = function (newDrugOrder) {
                return DateUtil.isSameDate(newDrugOrder.effectiveStartDate, DateUtil.parse(newDrugOrder.encounterDate)) &&
                    DateUtil.isSameDate(newDrugOrder.effectiveStartDate, DateUtil.now());

            };

            var setEffectiveDates = function (newDrugOrder, existingDrugOrders) {
                newDrugOrder.scheduledDate = newDrugOrder.effectiveStartDate;
                existingDrugOrders.forEach(function (existingDrugOrder) {
                    if (DateUtil.isSameDate(existingDrugOrder.effectiveStartDate, newDrugOrder.effectiveStopDate) && !DateUtil.isSameDate(existingDrugOrder.effectiveStopDate, newDrugOrder.effectiveStartDate)) {
                        if(!newDrugOrder.previousOrderUuid || newDrugOrder.previousOrderDurationInDays === newDrugOrder.durationInDays){
                            newDrugOrder.effectiveStopDate = DateUtil.subtractSeconds(existingDrugOrder.effectiveStartDate, 1);}
                        if(newDrugOrder.previousOrderUuid || DateUtil.isSameDate(newDrugOrder.effectiveStartDate,newDrugOrder.encounterDate)){
                            newDrugOrder.autoExpireDate = newDrugOrder.effectiveStopDate;
                        }
                    }
                    if (DateUtil.isSameDate(existingDrugOrder.effectiveStopDate, newDrugOrder.effectiveStartDate) && DateUtil.isSameDate(DateUtil.addSeconds(existingDrugOrder.effectiveStopDate, 1), newDrugOrder.effectiveStartDate)) {//compare date part only of datetime
                        if(!existingDrugOrder.uuid){
                            existingDrugOrder.effectiveStopDate = DateUtil.subtractSeconds(existingDrugOrder.effectiveStopDate, 1);
                        }
                        newDrugOrder.effectiveStartDate = DateUtil.addSeconds(existingDrugOrder.effectiveStopDate, 1);
                    }
                });
                if(isEffectiveStartDateSameAsToday(newDrugOrder)) {
                    newDrugOrder.scheduledDate = null;
                }
            };

            $scope.closeDialog = function(){
                ngDialog.close();
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
                    edit(index);
                }
            };

            $scope.toggleShowAdditionalInstructions = function (treatment) {
                treatment.showAdditionalInstructions = !treatment.showAdditionalInstructions;
            };

            $scope.toggleAsNeeded = function (treatment) {
                treatment.asNeeded = !treatment.asNeeded;
            };


            var edit = function (index) {
                clearHighlights();
                var treatment = $scope.treatments[index];
                markEitherVariableDrugOrUniformDrug(treatment);
                treatment.isBeingEdited = true;
                $scope.treatment = treatment.cloneForEdit(index, treatmentConfig);
                if($scope.treatment.quantity == 0){
                    $scope.treatment.quantity = null;
                    $scope.treatment.quantityEnteredManually = false;
                }
                selectDrugFromDropdown(treatment.drug);
            };

            $scope.$on("event:editDrugOrder", function (event, index) {
                edit(index);
            });

            var remove = function (index) {
                $scope.treatments.splice(index, 1);
            };

            $scope.$on("event:removeDrugOrder", function (event, index) {
                remove(index);
            });

            $scope.incompleteDrugOrders = function(){
                var anyValuesFilled =  $scope.treatment.drug || $scope.treatment.uniformDosingType.dose ||
                    $scope.treatment.uniformDosingType.frequency || $scope.treatment.variableDosingType.morningDose ||
                    $scope.treatment.variableDosingType.afternoonDose || $scope.treatment.variableDosingType.eveningDose ||
                    $scope.treatment.duration || $scope.treatment.quantity || $scope.treatment.isNonCodedDrug;
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
                return {allow: true};
            };

            var setIsNotBeingEdited = function (treatment) {
                treatment.isBeingEdited = false;
            };

            $scope.getDataResults = function (drugs) {
                var searchString = $scope.treatment.drugNameDisplay;
                var listOfDrugSynonyms = _.map(drugs, function(drug){
                    return Bahmni.Clinical.DrugSearchResult.getAllMatchingSynonyms(drug,searchString);
                });
                return _.flatten(listOfDrugSynonyms);
            };

            (function(){
                var selectedItem;
                $scope.onSelect =  function(item){
                    selectedItem = item;
                    //$scope.onChange(); angular will call onChange after onSelect by default if it is bahmni-autocomplete
                };
                $scope.onAccept = function(){
                    $scope.treatment.acceptedItem=$scope.treatment.drugNameDisplay;
                    $scope.onChange();
                };

                $scope.onChange = function (){
                    if(selectedItem){
                        $scope.treatment.isNonCodedDrug = false;
                        delete  $scope.treatment.drugNonCoded;
                        $scope.treatment.changeDrug({
                            name: selectedItem.drug.name,
                            form: selectedItem.drug.dosageForm && selectedItem.drug.dosageForm.display,
                            uuid: selectedItem.drug.uuid
                        });
                        selectedItem = null;
                        return;
                    }
                    if($scope.treatment.acceptedItem){
                        $scope.treatment.isNonCodedDrug = !$scope.treatment.isNonCodedDrug;
                        $scope.treatment.drugNonCoded = $scope.treatment.acceptedItem;
                        delete $scope.treatment.drug;
                        delete $scope.treatment.acceptedItem;
                        return;
                    }
                    delete $scope.treatment.drug;
                };
            })();

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

            var getActiveDrugOrders = function (activeDrugOrders) {
                var activeDrugOrdersList = activeDrugOrders || [];
                return activeDrugOrdersList.map(function (drugOrder) {
                    return DrugOrderViewModel.createFromContract(drugOrder, treatmentConfig);
                });
            };

            var removeOrder = function (removableOrder) {
                removableOrder.action = Bahmni.Clinical.Constants.orderActions.discontinue;
                removableOrder.previousOrderUuid = removableOrder.uuid;
                removableOrder.uuid = undefined;
                $scope.consultation.removableDrugs.push(removableOrder);
            };

            var saveTreatment = function () {
                var tabNames = Object.keys($scope.consultation.newlyAddedTabTreatments || {});
                var allTreatmentsAcrossTabs = _.map(tabNames,function(tabName){
                    return $scope.consultation.newlyAddedTabTreatments[tabName];
                });
                $scope.consultation.newlyAddedTreatments = _.flatten(allTreatmentsAcrossTabs);
                if ($scope.consultation.discontinuedDrugs) {
                    $scope.consultation.discontinuedDrugs.forEach(function (discontinuedDrug) {
                        var removableOrder = _.find(activeDrugOrders, {uuid: discontinuedDrug.uuid});
                        if (discontinuedDrug != null) {
                            removableOrder.orderReasonText = discontinuedDrug.orderReasonText;
                            removableOrder.dateActivated = discontinuedDrug.dateStopped;
                            removableOrder.scheduledDate = discontinuedDrug.dateStopped;

                            if (discontinuedDrug.orderReasonConcept != null && discontinuedDrug.orderReasonConcept.name) {
                                removableOrder.orderReasonConcept = {
                                    name: discontinuedDrug.orderReasonConcept.name.name,
                                    uuid: discontinuedDrug.orderReasonConcept.uuid
                                };
                            }
                        }
                        if (removableOrder) {
                            removeOrder(removableOrder);
                        }
                    })
                }
            };

            $scope.consultation.preSaveHandler.register("drugOrderSaveHandlerKey", saveTreatment);

            var init = function(){
                $scope.consultation.removableDrugs = $scope.consultation.removableDrugs || [];
                $scope.consultation.discontinuedDrugs = $scope.consultation.discontinuedDrugs || [];
                $scope.consultation.drugOrdersWithUpdatedOrderAttributes = $scope.consultation.drugOrdersWithUpdatedOrderAttributes || {};
                $scope.consultation.activeAndScheduledDrugOrders = getActiveDrugOrders(activeDrugOrders);
                $scope.treatmentConfig = treatmentConfig;// $scope.treatmentConfig used only in UI
            };
            init();
        }]);
