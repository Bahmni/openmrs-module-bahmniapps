'use strict';

angular.module('bahmni.clinical')
    .controller('DrugOrderHistoryController', ['$scope', '$filter', '$stateParams', 'activeDrugOrders',
        'treatmentConfig', 'treatmentService', 'spinner', 'drugOrderHistoryHelper', 'visitHistory', '$translate', '$rootScope',
        function ($scope, $filter, $stateParams, activeDrugOrders, treatmentConfig, treatmentService, spinner,
                   drugOrderHistoryHelper, visitHistory, $translate, $rootScope) {
            var DrugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel;
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var currentVisit = visitHistory.activeVisit;
            var activeDrugOrdersList = [];
            var prescribedDrugOrders = [];
            $scope.dispensePrivilege = Bahmni.Clinical.Constants.dispensePrivilege;
            $scope.scheduledDate = DateUtil.getDateWithoutTime(DateUtil.addDays(DateUtil.now(), 1));

            var createPrescriptionGroups = function (activeAndScheduledDrugOrders) {
                $scope.consultation.drugOrderGroups = [];
                createPrescribedDrugOrderGroups();
                createRecentDrugOrderGroup(activeAndScheduledDrugOrders);
            };

            var getPreviousVisitDrugOrders = function () {
                var currentVisitIndex = _.findIndex($scope.consultation.drugOrderGroups, function (group) {
                    return group.isCurrentVisit;
                });

                if ($scope.consultation.drugOrderGroups[currentVisitIndex + 1]) {
                    return $scope.consultation.drugOrderGroups[currentVisitIndex + 1].drugOrders;
                }
                return [];
            };

            var sortOrderSetDrugsFollowedByDrugOrders = function (drugOrders, showOnlyActive) {
                var orderSetOrdersAndDrugOrders = _.groupBy(drugOrders, function (drugOrder) {
                    if (drugOrder.orderGroupUuid) {
                        return 'orderSetOrders';
                    }
                    return 'drugOrders';
                });
                var refillableDrugOrders = drugOrderHistoryHelper.getRefillableDrugOrders(orderSetOrdersAndDrugOrders.drugOrders, getPreviousVisitDrugOrders(), showOnlyActive);
                return _(orderSetOrdersAndDrugOrders.orderSetOrders)
                    .concat(refillableDrugOrders)
                    .uniqBy('uuid')
                    .value();
            };

            var createRecentDrugOrderGroup = function (activeAndScheduledDrugOrders) {
                var showOnlyActive = treatmentConfig.drugOrderHistoryConfig.showOnlyActive;
                var refillableGroup = {
                    label: $translate.instant("MEDICATION_RECENT_TAB"),
                    selected: true,
                    drugOrders: sortOrderSetDrugsFollowedByDrugOrders(activeAndScheduledDrugOrders, showOnlyActive)
                };
                $scope.consultation.drugOrderGroups.unshift(refillableGroup);
                if (treatmentConfig.drugOrderHistoryConfig.numberOfVisits !== undefined && treatmentConfig.drugOrderHistoryConfig.numberOfVisits !== null && treatmentConfig.drugOrderHistoryConfig.numberOfVisits === 0) {
                    $scope.consultation.drugOrderGroups = [$scope.consultation.drugOrderGroups[0]];
                }
            };

            var createPrescribedDrugOrderGroups = function () {
                if (prescribedDrugOrders.length === 0) {
                    return [];
                }
                var drugOrderGroupedByDate = _.groupBy(prescribedDrugOrders, function (drugOrder) {
                    return DateUtil.parse(drugOrder.visit.startDateTime);
                });

                var createDrugOrder = function (drugOrder) {
                    return DrugOrderViewModel.createFromContract(drugOrder, treatmentConfig);
                };

                var drugOrderGroups = _.map(drugOrderGroupedByDate, function (drugOrders, visitStartDate) {
                    return {
                        label: $filter("bahmniDate")(visitStartDate),
                        visitStartDate: DateUtil.parse(visitStartDate),
                        drugOrders: drugOrders.map(createDrugOrder),
                        isCurrentVisit: currentVisit && DateUtil.isSameDateTime(visitStartDate, currentVisit.startDatetime)
                    };
                });
                $scope.consultation.drugOrderGroups = $scope.consultation.drugOrderGroups.concat(drugOrderGroups);
                $scope.consultation.drugOrderGroups = _.sortBy($scope.consultation.drugOrderGroups, 'visitStartDate').reverse();
            };

            $scope.stoppedOrderReasons = treatmentConfig.stoppedOrderReasonConcepts;

            var init = function () {
                var numberOfVisits = treatmentConfig.drugOrderHistoryConfig.numberOfVisits ? treatmentConfig.drugOrderHistoryConfig.numberOfVisits : 3;
                spinner.forPromise(treatmentService.getPrescribedDrugOrders(
                    $stateParams.patientUuid, true, numberOfVisits, $stateParams.dateEnrolled, $stateParams.dateCompleted).then(function (data) {
                        prescribedDrugOrders = data;
                        createPrescriptionGroups($scope.consultation.activeAndScheduledDrugOrders);
                    }));
            };
            $scope.getOrderReasonConcept = function (drugOrder) {
                if (drugOrder.orderReasonConcept) {
                    return drugOrder.orderReasonConcept.display || drugOrder.orderReasonConcept.name;
                }
            };

            $scope.toggleShowAdditionalInstructions = function (line) {
                line.showAdditionalInstructions = !line.showAdditionalInstructions;
            };

            $scope.drugOrderGroupsEmpty = function () {
                return _.isEmpty($scope.consultation.drugOrderGroups);
            };

            $scope.isDrugOrderGroupEmpty = function (drugOrders) {
                return _.isEmpty(drugOrders);
            };

            $scope.showEffectiveFromDate = function (visitStartDate, effectiveStartDate) {
                return $filter("bahmniDate")(effectiveStartDate) !== $filter("bahmniDate")(visitStartDate);
            };

            $scope.refill = function (drugOrder) {
                $rootScope.$broadcast("event:refillDrugOrder", drugOrder);
            };

            $scope.refillAll = function (drugOrders) {
                $rootScope.$broadcast("event:refillDrugOrders", drugOrders);
            };

            $scope.revise = function (drugOrder, drugOrders) {
                if ($scope.consultation.drugOrdersWithUpdatedOrderAttributes[drugOrder.uuid]) {
                    delete $scope.consultation.drugOrdersWithUpdatedOrderAttributes[drugOrder.uuid];
                    $scope.toggleDrugOrderAttribute(drugOrder.orderAttributes[0]);
                }

                if (drugOrder.isEditAllowed) {
                    $rootScope.$broadcast("event:reviseDrugOrder", drugOrder, drugOrders);
                }
            };

            $scope.updateFormConditions = function (drugOrder) {
                var formCondition = Bahmni.ConceptSet.FormConditions.rules ? Bahmni.ConceptSet.FormConditions.rules["Medication Stop Reason"] : undefined;
                if (formCondition) {
                    if (drugOrder.orderReasonConcept) {
                        if (!formCondition(drugOrder, drugOrder.orderReasonConcept.name.name)) {
                            disableAndClearReasonText(drugOrder);
                        }
                    } else {
                        disableAndClearReasonText(drugOrder);
                    }
                } else {
                    drugOrder.orderReasonNotesEnabled = true;
                }
            };

            var disableAndClearReasonText = function (drugOrder) {
                drugOrder.orderReasonText = null;
                drugOrder.orderReasonNotesEnabled = false;
            };

            $scope.discontinue = function (drugOrder) {
                if (drugOrder.isDiscontinuedAllowed) {
                    $rootScope.$broadcast("event:discontinueDrugOrder", drugOrder);
                    $scope.updateFormConditions(drugOrder);
                }
            };

            $scope.undoDiscontinue = function (drugOrder) {
                $rootScope.$broadcast("event:undoDiscontinueDrugOrder", drugOrder);
            };

            $scope.shouldBeDisabled = function (drugOrder, orderAttribute) {
                if (drugOrder.isBeingEdited) {
                    return true;
                }
                return !drugOrder.isActive() || orderAttribute.obsUuid;
            };

            $scope.updateOrderAttribute = function (drugOrder, orderAttribute, valueToSet) {
                if (!$scope.shouldBeDisabled(drugOrder, orderAttribute)) {
                    $scope.toggleDrugOrderAttribute(orderAttribute, valueToSet);
                    $scope.consultation.drugOrdersWithUpdatedOrderAttributes[drugOrder.uuid] = drugOrder;
                }
            };

            $scope.toggleDrugOrderAttribute = function (orderAttribute, valueToSet) {
                orderAttribute.value = valueToSet !== undefined ? valueToSet : !orderAttribute.value;
            };

            $scope.getOrderAttributes = function () {
                return treatmentConfig.orderAttributes;
            };

            $scope.updateAllOrderAttributesByName = function (orderAttribute, drugOrderGroup) {
                drugOrderGroup[orderAttribute.name] = drugOrderGroup[orderAttribute.name] || {};
                drugOrderGroup[orderAttribute.name].selected = drugOrderGroup[orderAttribute.name].selected ? false : true;

                drugOrderGroup.drugOrders.forEach(function (drugOrder) {
                    var selectedOrderAttribute = getAttribute(drugOrder, orderAttribute.name);
                    $scope.updateOrderAttribute(drugOrder, selectedOrderAttribute, drugOrderGroup[orderAttribute.name].selected);
                });
            };

            $scope.allOrderAttributesOfNameSet = function (drugOrderGroup, orderAttributeName) {
                var allAttributesSelected = true;
                drugOrderGroup.drugOrders.forEach(function (drugOrder) {
                    var orderAttributeOfName = getAttribute(drugOrder, orderAttributeName);
                    if (!$scope.shouldBeDisabled(drugOrder, orderAttributeOfName) && !orderAttributeOfName.value) {
                        allAttributesSelected = false;
                    }
                });
                drugOrderGroup[orderAttributeName] = drugOrderGroup[orderAttributeName] || {};
                drugOrderGroup[orderAttributeName].selected = allAttributesSelected;
            };

            $scope.canUpdateAtLeastOneOrderAttributeOfName = function (drugOrderGroup, orderAttributeName) {
                var canBeUpdated = false;
                drugOrderGroup.drugOrders.forEach(function (drugOrder) {
                    var orderAttributeOfName = getAttribute(drugOrder, orderAttributeName);
                    if (!$scope.shouldBeDisabled(drugOrder, orderAttributeOfName)) {
                        canBeUpdated = true;
                    }
                });
                return canBeUpdated;
            };

            $scope.getMinDateForDiscontinue = function (drugOrder) {
                var minDate = DateUtil.today();
                if (DateUtil.isBeforeDate(drugOrder.effectiveStartDate, minDate)) {
                    minDate = drugOrder.effectiveStartDate;
                }
                return DateUtil.getDateWithoutTime(minDate);
            };

            var getAttribute = function (drugOrder, attributeName) {
                return _.find(drugOrder.orderAttributes, {name: attributeName});
            };

            init();
        }]);
