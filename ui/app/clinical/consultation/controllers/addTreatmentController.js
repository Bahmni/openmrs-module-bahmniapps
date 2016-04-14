'use strict';

angular.module('bahmni.clinical')
    .controller('AddTreatmentController', ['$scope', '$rootScope', 'contextChangeHandler', 'treatmentConfig', 'drugService',
        '$timeout', 'clinicalAppConfigService', 'ngDialog', '$window', 'messagingService', 'appService', 'activeDrugOrders',
        'orderSets', 'orderSetService', '$q', 'locationService',
        function ($scope, $rootScope, contextChangeHandler, treatmentConfig, drugService, $timeout,
                  clinicalAppConfigService, ngDialog, $window, messagingService, appService, activeDrugOrders, orderSets,
                  orderSetService, $q, locationService) {

            var DateUtil = Bahmni.Common.Util.DateUtil;
            var DrugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel;

            $scope.showOrderSetDetails = true;
            $scope.addTreatment = true;
            $scope.canOrderSetBeAdded = true;

            $scope.treatmentActionLinks = clinicalAppConfigService.getTreatmentActionLink();

            var preFetchDrugsForGivenConceptSet = function () {
                drugService.getSetMembersOfConcept(treatmentConfig.getDrugConceptSet()).then(function (result) {
                    $scope.drugs = result.map(Bahmni.Clinical.DrugSearchResult.create);
                });
            };
            if (treatmentConfig.isDropDownForGivenConceptSet()) {
                preFetchDrugsForGivenConceptSet();
            }
            if (treatmentConfig.isAutoCompleteForAllConcepts()) {
                $scope.getDrugs = function (request) {
                    return drugService.search(request.term);
                };
            }
            if (treatmentConfig.isAutoCompleteForGivenConceptSet()) {
                $scope.getDrugs = function (request) {
                    return drugService.getSetMembersOfConcept(treatmentConfig.getDrugConceptSet(), request.term);
                };
            }

            $scope.doseFractions = treatmentConfig.getDoseFractions();
            $scope.showDoseFractions = treatmentConfig.inputOptionsConfig.showDoseFractions;
            $scope.isDoseFractionsAvailable = function () {
                return $scope.doseFractions && !_.isEmpty($scope.doseFractions) ? true : false;
            };

            $scope.isSelected = function (drug) {
                var selectedDrug = $scope.treatment.drug;
                return selectedDrug && drug.drug.name === selectedDrug.name;
            };

            $scope.selectFromDefaultDrugList = function () {
                $scope.onSelect($scope.treatment.selectedItem);
                $scope.onChange();
            };

            var markVariable = function (variable) {
                $scope[variable] = true;
                $timeout(function () {
                    $scope[variable] = false;
                });
            };

            var markEitherVariableDrugOrUniformDrug = function (drug) {
                if (drug.isVariableDosingType()) {
                    markVariable('editDrugEntryVariableFrequency');
                }
                else {
                    markVariable('editDrugEntryUniformFrequency');
                }
            };

            markVariable("startNewDrugEntry");

            var setDrugOrderBeingEdited, clearHighlights;
            (function () {
                var drugOrderBeingEdited = null;

                setDrugOrderBeingEdited = function (drugOder) {
                    drugOrderBeingEdited = drugOder;
                };

                clearHighlights = function () {
                    $scope.treatments.forEach(setIsNotBeingEdited);
                    $scope.orderSetTreatments.forEach(setIsNotBeingEdited);
                    if (drugOrderBeingEdited) {
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
                    doseUnits: treatment.doseUnits,
                    duration: treatment.duration,
                    durationUnit: treatment.durationUnit
                };
            };

            var isSameDrugBeingDiscontinuedAndOrdered = function () {
                var existingTreatment = false;
                angular.forEach($scope.consultation.discontinuedDrugs, function (drugOrder) {
                    existingTreatment = _.some($scope.treatments, function (treatment) {
                            return treatment.getDisplayName() === drugOrder.getDisplayName();
                        }) && drugOrder.isMarkedForDiscontinue;
                });
                return existingTreatment;
            };

            var clearOtherDrugOrderActions = function (drugOrders) {
                drugOrders.forEach(function (drugOrder) {
                    drugOrder.isDiscontinuedAllowed = true;
                    drugOrder.isBeingEdited = false;
                });
            };

            var setNonCodedDrugConcept = function (treatment) {
                if (treatment.drugNonCoded) {
                    treatment.concept = treatmentConfig.nonCodedDrugconcept;
                }
            };

            $scope.refillDrug = function (drugOrder, alreadyActiveSimilarOrder) {
                $scope.bulkSelectCheckbox = false;
                var existingOrderStopDate = alreadyActiveSimilarOrder ? alreadyActiveSimilarOrder.effectiveStopDate : null;
                var refillDrugOrder = drugOrder.refill(existingOrderStopDate);
                setNonCodedDrugConcept(refillDrugOrder);
                setDrugOrderBeingEdited(drugOrder);
                $scope.treatments.push(refillDrugOrder);
                markVariable("startNewDrugEntry");
                ngDialog.close();
            };


            $scope.refillOrderSet = function (drugOrder) {
                var drugOrdersOfOrderSet = _.filter($scope.consultation.activeAndScheduledDrugOrders, function (treatment) {
                    return treatment.orderGroupUuid === drugOrder.orderGroupUuid;
                });
                refillDrugOrders(drugOrdersOfOrderSet);
                ngDialog.close();
            };

            $scope.$on("event:refillDrugOrder", function (event, drugOrder, alreadyActiveSimilarOrder) {
                if (drugOrder.orderGroupUuid) {
                    ngDialog.open({
                        template: 'consultation/views/treatmentSections/refillDrugOrderSetModal.html',
                        scope: $scope,
                        data: {
                            drugOrder: drugOrder,
                            alreadyActiveSimilarOrder: alreadyActiveSimilarOrder
                        }
                    });
                    $scope.popupActive = true;
                    return;
                }
                $scope.refillDrug(drugOrder, alreadyActiveSimilarOrder);
            });

            var refillDrugOrders = function (drugOrders) {
                drugOrders.forEach(function (drugOrder) {
                    setNonCodedDrugConcept(drugOrder);
                    if (drugOrder.effectiveStopDate) {
                        var refill = drugOrder.refill();
                        $scope.treatments.push(refill);
                    }
                });
            };

            $scope.$on("event:refillDrugOrders", function (event, drugOrders) {
                $scope.bulkSelectCheckbox = false;
                refillDrugOrders(drugOrders);
            });

            $scope.$on("event:discontinueDrugOrder", function (event, drugOrder) {
                drugOrder.isMarkedForDiscontinue = true;
                drugOrder.isEditAllowed = false;
                drugOrder.dateStopped = DateUtil.now();
                $scope.consultation.discontinuedDrugs.push(drugOrder);
                $scope.minDateStopped = DateUtil.getDateWithoutTime(drugOrder.effectiveStartDate < DateUtil.now() ? drugOrder.effectiveStartDate : DateUtil.now());
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
                drugOrder.orderReasonText = null;
                drugOrder.isMarkedForDiscontinue = false;
                drugOrder.isEditAllowed = true;
            });


            var selectDrugFromDropdown = function (drug_) {
                if (treatmentConfig.isDropDownForGivenConceptSet()) {
                    $scope.treatment.selectedItem = _.find($scope.drugs, function (drug) {
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
                if ($scope.treatment.frequencyType === Bahmni.Clinical.Constants.dosingTypes.variable) {
                    $scope.treatment.isUniformFrequency = false;
                }
                $scope.treatment.quantity = $scope.treatment.quantity ? $scope.treatment.quantity : null;
            });

            $scope.$watch(watchFunctionForQuantity, function () {
                $scope.treatment.calculateQuantityAndUnit();
            }, true);

            $scope.add = function () {
                var treatments = $scope.treatments;
                if ($scope.treatment.isNewOrderSet) {
                    treatments = $scope.orderSetTreatments;
                }
                $scope.treatment.dosingInstructionType = Bahmni.Clinical.Constants.flexibleDosingInstructionsClass;
                if ($scope.treatment.isNonCodedDrug) {
                    $scope.treatment.drugNonCoded = $scope.treatment.drugNameDisplay;
                }
                $scope.treatment.setUniformDoseFraction();
                var newDrugOrder = $scope.treatment;
                setNonCodedDrugConcept($scope.treatment);

                newDrugOrder.calculateEffectiveStopDate();

                if (getConflictingDrugOrder(newDrugOrder)) {
                    if ($scope.alreadyActiveSimilarOrder.isNewOrderSet) {
                        $scope.conflictingIndex = _.findIndex($scope.orderSetTreatments, $scope.alreadyActiveSimilarOrder);
                    } else {
                        $scope.conflictingIndex = _.findIndex($scope.treatments, $scope.alreadyActiveSimilarOrder);
                    }
                    ngDialog.open({
                        template: 'consultation/views/treatmentSections/conflictingDrugOrderModal.html',
                        scope: $scope
                    });
                    $scope.popupActive = true;
                    return;
                }
                if (!$scope.treatment.quantity) {
                    $scope.treatment.quantity = 0;
                }

                    if ($scope.treatment.isBeingEdited) {
                        treatments.splice($scope.treatment.currentIndex, 1, $scope.treatment);
                        $scope.treatment.isBeingEdited = false;
                    } else {
                        treatments.push($scope.treatment);
                    }
                    $scope.clearForm();

            };

            var getConflictingDrugOrder = function (newDrugOrder) {
                var allDrugOrders = $scope.treatments.concat($scope.orderSetTreatments);
                allDrugOrders = _.reject(allDrugOrders, newDrugOrder);
                var unsavedNotBeingEditedOrders = _.filter(allDrugOrders, {isBeingEdited: false});
                var existingDrugOrders;
                if (newDrugOrder.isBeingEdited) {
                    existingDrugOrders = _.reject($scope.consultation.activeAndScheduledDrugOrders, {uuid: newDrugOrder.previousOrderUuid});
                } else {
                    existingDrugOrders = $scope.consultation.activeAndScheduledDrugOrders;
                }
                existingDrugOrders = existingDrugOrders.concat(unsavedNotBeingEditedOrders);

                var potentiallyOverlappingOrders = existingDrugOrders.filter(function (drugOrder) {
                    return (drugOrder.getDisplayName() === newDrugOrder.getDisplayName() && drugOrder.overlappingScheduledWith(newDrugOrder));
                });

                setEffectiveDates(newDrugOrder, potentiallyOverlappingOrders);


                var alreadyActiveSimilarOrders = existingDrugOrders.filter(function (drugOrder) {
                    return (drugOrder.getDisplayName() === newDrugOrder.getDisplayName() && drugOrder.overlappingScheduledWith(newDrugOrder));
                });

                if (alreadyActiveSimilarOrders.length > 0) {
                    $scope.alreadyActiveSimilarOrder = _.sortBy(potentiallyOverlappingOrders, 'effectiveStartDate').reverse()[0];
                    return $scope.alreadyActiveSimilarOrder;
                }
                return false;
            };

            var isEffectiveStartDateSameAsToday = function (newDrugOrder) {
                return DateUtil.isSameDate(newDrugOrder.effectiveStartDate, DateUtil.parse(newDrugOrder.encounterDate)) &&
                    DateUtil.isSameDate(newDrugOrder.effectiveStartDate, DateUtil.now());

            };

            var setEffectiveDates = function (newDrugOrder, existingDrugOrders) {
                newDrugOrder.scheduledDate = newDrugOrder.effectiveStartDate;
                existingDrugOrders.forEach(function (existingDrugOrder) {
                    if (DateUtil.isSameDate(existingDrugOrder.effectiveStartDate, newDrugOrder.effectiveStopDate) && !DateUtil.isSameDate(existingDrugOrder.effectiveStopDate, newDrugOrder.effectiveStartDate)) {
                        if (!newDrugOrder.previousOrderUuid || newDrugOrder.previousOrderDurationInDays === newDrugOrder.durationInDays) {
                            newDrugOrder.effectiveStopDate = DateUtil.subtractSeconds(existingDrugOrder.effectiveStartDate, 1);
                        }
                        if (newDrugOrder.previousOrderUuid || DateUtil.isSameDate(newDrugOrder.effectiveStartDate, newDrugOrder.encounterDate)) {
                            newDrugOrder.autoExpireDate = newDrugOrder.effectiveStopDate;
                        }
                    }
                    if (DateUtil.isSameDate(existingDrugOrder.effectiveStopDate, newDrugOrder.effectiveStartDate) && DateUtil.isSameDate(DateUtil.addSeconds(existingDrugOrder.effectiveStopDate, 1), newDrugOrder.effectiveStartDate)) {//compare date part only of datetime
                        if (!existingDrugOrder.uuid) {
                            existingDrugOrder.effectiveStopDate = DateUtil.subtractSeconds(existingDrugOrder.effectiveStopDate, 1);
                        }
                        newDrugOrder.effectiveStartDate = DateUtil.addSeconds(existingDrugOrder.effectiveStopDate, 1);
                    }
                });
                if (isEffectiveStartDateSameAsToday(newDrugOrder)) {
                    newDrugOrder.scheduledDate = null;
                }
            };

            $scope.closeDialog = function () {
                ngDialog.close();
            };

            $scope.refillConflictingDrug = function (drugOrder, alreadyActiveSimilarOrder) {
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
                else {
                    edit(drugOrder, index);
                }
            };

            $scope.toggleShowAdditionalInstructions = function (treatment) {
                treatment.showAdditionalInstructions = !treatment.showAdditionalInstructions;
            };

            $scope.toggleAsNeeded = function (treatment) {
                treatment.asNeeded = !treatment.asNeeded;
            };


            var edit = function (drugOrder, index) {
                clearHighlights();
                var treatment = drugOrder;
                markEitherVariableDrugOrUniformDrug(treatment);
                treatment.isBeingEdited = true;
                $scope.treatment = treatment.cloneForEdit(index, treatmentConfig);
                if ($scope.treatment.quantity === 0) {
                    $scope.treatment.quantity = null;
                    $scope.treatment.quantityEnteredManually = false;
                }
                selectDrugFromDropdown(treatment.drug);
            };

            $scope.$on("event:editDrugOrder", function (event, drugOrder, index) {
                edit(drugOrder, index);
            });


            $scope.$on("event:removeDrugOrder", function (event, index) {
                $scope.treatments.splice(index, 1);
            });

            $scope.incompleteDrugOrders = function () {
                var anyValuesFilled = $scope.treatment.drug || $scope.treatment.uniformDosingType.dose ||
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
                if (isSameDrugBeingDiscontinuedAndOrdered()) {
                    return {allow: false, errorMessage: errorMessages.discontinuingAndOrderingSameDrug};
                }
                if ($scope.incompleteDrugOrders()) {
                    $scope.formInvalid = true;
                    return {allow: false};
                }
                if ($scope.unaddedDrugOrders()) {
                    return {allow: false, errorMessage: errorMessages.incompleteForm};
                }
                var valid = _.every($scope.treatments, function (drugOrder) {
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
                var listOfDrugSynonyms = _.map(drugs, function (drug) {
                    return Bahmni.Clinical.DrugSearchResult.getAllMatchingSynonyms(drug, searchString);
                });
                return _.flatten(listOfDrugSynonyms);
            };

            (function () {
                var selectedItem;
                $scope.onSelect = function (item) {
                    selectedItem = item;
                    //$scope.onChange(); angular will call onChange after onSelect by default if it is bahmni-autocomplete
                };
                $scope.onAccept = function () {
                    $scope.treatment.acceptedItem = $scope.treatment.drugNameDisplay;
                    $scope.onChange();
                };

                $scope.onChange = function () {
                    if (selectedItem) {
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
                    if ($scope.treatment.acceptedItem) {
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
                var url, location;
                locationService.getLoggedInLocation().then(function(response){
                    location = response.name;
                    url = extension.url
                        .replace("{{patient_ref}}", $scope.patient.identifier)
                        .replace("{{location_ref}}", location);
                    $window.open(url, "_blank");
                });
            };

            $scope.toggleTabIndexWithinModal = function (event) {
                var buttonsToFocusOn = ["modal-revise-button", "modal-refill-button"];
                var focusedButton = event.target;
                focusedButton.tabIndex = 1;

                buttonsToFocusOn.splice(buttonsToFocusOn.indexOf(focusedButton.id), 1);
                var otherButton = buttonsToFocusOn[0];
                $("#" + otherButton)[0].tabIndex = 2;
            };

            $scope.toggleDrugOrderAttribute = function (orderAttribute) {
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
                var allTreatmentsAcrossTabs = _.flatten(_.map(tabNames, function (tabName) {
                    return $scope.consultation.newlyAddedTabTreatments[tabName].treatments;
                }));
                var orderSetTreatmentsAcrossTabs = _.flatten(_.map(tabNames, function (tabName) {
                    return $scope.consultation.newlyAddedTabTreatments[tabName].orderSetTreatments;
                }));
                var includedOrderSetTreatments = _.filter(orderSetTreatmentsAcrossTabs, function (treatment) {
                    return treatment.orderSetUuid ? treatment.include : true;
                });
                $scope.consultation.newlyAddedTreatments = allTreatmentsAcrossTabs.concat(includedOrderSetTreatments);
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

            var putCalculatedDose = function (orderTemplate) {
                var calculatedDose = orderSetService.getCalculatedDose(
                    $scope.patient.uuid,
                    orderTemplate.dosingInstructions.dose,
                    orderTemplate.dosingInstructions.doseUnits
                );
                return calculatedDose.then(function (calculatedDosage) {
                        orderTemplate.dosingInstructions.dose = calculatedDosage.dose;
                        orderTemplate.dosingInstructions.doseUnits = calculatedDosage.doseUnit;
                        return orderTemplate;
                    });
            };

            var deleteDrugIfEmpty = function (template) {
                if (_.isEmpty(template.drug)) {
                    delete template.drug; //_.isEmpty({}) is true.
                }
            };

            var setUpOrderSetTransactionalData = function (orderSetMember) {
                orderSetMember.orderTemplateMetaData = orderSetMember.orderTemplate;
                orderSetMember.orderTemplate = JSON.parse(orderSetMember.orderTemplate);
                orderSetMember.orderTemplate.concept = {
                    name: orderSetMember.concept.display,
                    uuid: orderSetMember.concept.uuid
                };
                deleteDrugIfEmpty(orderSetMember.orderTemplate);
                putCalculatedDose(orderSetMember.orderTemplate);
            };

            $scope.addOrderSet = function (orderSet) {
                $scope.newOrderSet.name = orderSet.name;
                $scope.newOrderSet.uuid = orderSet.uuid;
                var conflictingDrugOrders = [];
                _.each(orderSet.orderSetMembers, function (orderSetMember) {
                    orderSetMember.orderTemplate.effectiveStartDate = $scope.newOrderSet.date;
                    var drugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel.createFromContract(Bahmni.Clinical.DrugOrder.create(orderSetMember.orderTemplate), treatmentConfig);
                    drugOrderViewModel.orderSetUuid = orderSet.uuid;
                    drugOrderViewModel.isNewOrderSet = true;
                    drugOrderViewModel.dosingInstructionType = Bahmni.Clinical.Constants.flexibleDosingInstructionsClass;
                    if (!drugOrderViewModel.quantity) {
                        drugOrderViewModel.quantity = 0;
                    }
                    drugOrderViewModel.calculateDurationUnit();
                    drugOrderViewModel.calculateQuantityAndUnit();
                    drugOrderViewModel.calculateEffectiveStopDate();
                    drugOrderViewModel.setUniformDoseFraction();
                    var conflictingDrugOrder = getConflictingDrugOrder(drugOrderViewModel);
                    if (!conflictingDrugOrder) {
                        drugOrderViewModel.include = true;
                    } else {
                        conflictingDrugOrders.push(conflictingDrugOrder);
                    }

                    $scope.orderSetTreatments.push(drugOrderViewModel);
                });
                if (conflictingDrugOrders.length > 0) {
                    _.each($scope.orderSetTreatments,function(orderSetDrugOrder){
                        orderSetDrugOrder.include = false;
                    });
                    ngDialog.open({
                        template: 'consultation/views/treatmentSections/conflictingOrderSet.html',
                        data: {'conflictingDrugOrders': conflictingDrugOrders}
                    });
                    $scope.popupActive = true;
                }

            };

            $scope.removeOrderSet = function () {
                delete $scope.newOrderSet.name;
                delete $scope.newOrderSet.uuid;
                $scope.orderSetTreatments.splice(0, $scope.orderSetTreatments.length);
            };

            $scope.$on("event:includeOrderSetDrugOrder", function (event, drugOrder) {
                var conflictingDrugOrder = getConflictingDrugOrder(drugOrder);
                if (conflictingDrugOrder) {
                    drugOrder.include = false;
                    ngDialog.open({
                        template: 'consultation/views/treatmentSections/conflictingOrderSet.html',
                        data: {'conflictingDrugOrders': [conflictingDrugOrder]}
                    });
                    $scope.popupActive = true;
                }
            });

            $scope.consultation.preSaveHandler.register("drugOrderSaveHandlerKey", saveTreatment);

            var init = function () {
                $scope.consultation.removableDrugs = $scope.consultation.removableDrugs || [];
                $scope.consultation.discontinuedDrugs = $scope.consultation.discontinuedDrugs || [];
                $scope.consultation.drugOrdersWithUpdatedOrderAttributes = $scope.consultation.drugOrdersWithUpdatedOrderAttributes || {};
                $scope.consultation.activeAndScheduledDrugOrders = getActiveDrugOrders(activeDrugOrders);
                $scope.treatmentConfig = treatmentConfig;// $scope.treatmentConfig used only in UI
                $scope.orderSets = orderSets;

                _.each($scope.orderSets, function (orderSet) {
                    _.each(orderSet.orderSetMembers, setUpOrderSetTransactionalData);
                });
            };
            init();
        }]);
