'use strict';

angular.module('bahmni.clinical')
    .controller('DrugOrderHistoryController', ['$scope', '$filter', '$stateParams', 'activeDrugOrders',
        'treatmentConfig', 'TreatmentService', 'spinner', 'clinicalAppConfigService','drugOrderHistoryHelper', 'visitHistory',
        function ($scope, $filter, $stateParams, activeDrugOrders, treatmentConfig, treatmentService, spinner,
                  clinicalAppConfigService, drugOrderHistoryHelper, visitHistory) {

            var DrugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel;
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var drugOrderUtil = Bahmni.Clinical.DrugOrder.Util;
            var currentVisit = visitHistory.activeVisit;
            var drugOrderAppConfig = clinicalAppConfigService.getDrugOrderConfig();
            var activeDrugOrdersList = [];
            var prescribedDrugOrders = [];
            $scope.dispensePrivilege = Bahmni.Clinical.Constants.dispensePrivilege;
            $scope.minDateStopped = DateUtil.getDateWithoutTime(DateUtil.now());
            $scope.scheduledDate = DateUtil.getDateWithoutTime(DateUtil.now());

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

            var createRecentDrugOrderGroup = function (activeAndScheduledDrugOrders) {
                var showOnlyActive = clinicalAppConfigService.getDrugOrderConfig().showOnlyActive;
                var refillableGroup = {
                    label: 'Recent',
                    selected: true,
                    drugOrders: drugOrderHistoryHelper.getRefillableDrugOrders(activeAndScheduledDrugOrders,
                        getPreviousVisitDrugOrders(), showOnlyActive)
                };
                $scope.consultation.drugOrderGroups.unshift(refillableGroup);
                if(drugOrderAppConfig.numberOfVisits != undefined && drugOrderAppConfig.numberOfVisits == 0)
                    $scope.consultation.drugOrderGroups = [$scope.consultation.drugOrderGroups[0]];
            };

            var createPrescribedDrugOrderGroups = function () {
                if (prescribedDrugOrders.length == 0) return [];
                var sortedDrugOrders = _.sortBy(prescribedDrugOrders, 'orderNumber');
                var drugOrderGroupedByDate = _.groupBy(sortedDrugOrders, function (drugOrder) {
                    return DateUtil.parse(drugOrder.visit.startDateTime);
                });

                var createDrugOrder = function (drugOrder) {
                    return DrugOrderViewModel.createFromContract(drugOrder, drugOrderAppConfig, treatmentConfig);
                };

                var drugOrderGroups = _.map(drugOrderGroupedByDate, function (drugOrders, visitStartDate) {
                    return {
                        label: $filter("bahmniDate")(visitStartDate),
                        visitStartDate: DateUtil.parse(visitStartDate),
                        drugOrders: drugOrders.map(createDrugOrder),
                        isCurrentVisit: currentVisit && DateUtil.isSameDateTime(visitStartDate, currentVisit.startDatetime)
                    }
                });
                $scope.consultation.drugOrderGroups = $scope.consultation.drugOrderGroups.concat(drugOrderGroups);
                $scope.consultation.drugOrderGroups = _.sortBy($scope.consultation.drugOrderGroups, 'visitStartDate').reverse();
            };

            var getActiveDrugOrders = function (activeDrugOrders) {
                activeDrugOrdersList = activeDrugOrders || [];
                return activeDrugOrdersList.map(function (drugOrder) {
                    return DrugOrderViewModel.createFromContract(drugOrder, drugOrderAppConfig, treatmentConfig);
                });
            };

            $scope.stoppedOrderReasons = treatmentConfig.stoppedOrderReasonConcepts;

            var init = function () {
                $scope.consultation.removableDrugs = $scope.consultation.removableDrugs || [];
                $scope.consultation.discontinuedDrugs = $scope.consultation.discontinuedDrugs || [];
                $scope.consultation.drugOrdersWithUpdatedOrderAttributes = $scope.consultation.drugOrdersWithUpdatedOrderAttributes || {};
                $scope.consultation.activeAndScheduledDrugOrders = getActiveDrugOrders(activeDrugOrders);

                var numberOfVisits = drugOrderAppConfig.numberOfVisits ? drugOrderAppConfig.numberOfVisits : 3;
                spinner.forPromise(treatmentService.getPrescribedDrugOrders(
                    $stateParams.patientUuid, true, numberOfVisits).then(function (data) {
                        prescribedDrugOrders = data;
                        createPrescriptionGroups($scope.consultation.activeAndScheduledDrugOrders);
                    }));
            };
            $scope.getOrderReasonConcept = function(drugOrder){
               if(drugOrder.orderReasonConcept)
                return drugOrder.orderReasonConcept.display||drugOrder.orderReasonConcept.name  ;
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
                $scope.$parent.$broadcast("event:refillDrugOrder", drugOrder);
            };

            $scope.refillAll = function (drugOrders) {
                $scope.$parent.$broadcast("event:refillDrugOrders", drugOrders);
            };

            $scope.revise = function (drugOrder, drugOrders) {
                if (drugOrder.isEditAllowed) {
                    $scope.$parent.$broadcast("event:reviseDrugOrder", drugOrder, drugOrders);
                }
            };

            $scope.discontinue = function (drugOrder) {
                if (drugOrder.isDiscontinuedAllowed) {
                    drugOrder.isMarkedForDiscontinue = true;
                    drugOrder.isEditAllowed = false;
                    drugOrder.dateStopped = DateUtil.now();
                    $scope.consultation.discontinuedDrugs.push(drugOrder);
                    $scope.minDateStopped = DateUtil.getDateWithoutTime(drugOrder.effectiveStartDate<DateUtil.now()?drugOrder.effectiveStartDate:DateUtil.now());
                }
            };

            $scope.undoDiscontinue = function (drugOrder) {
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
            };


            var removeOrder = function (removableOrder) {
                removableOrder.action = Bahmni.Clinical.Constants.orderActions.discontinue;
                removableOrder.previousOrderUuid = removableOrder.uuid;
                removableOrder.uuid = undefined;
                $scope.consultation.removableDrugs.push(removableOrder);
            };

            var saveTreatment = function () {
                $scope.consultation.discontinuedDrugs && $scope.consultation.discontinuedDrugs.forEach(function (discontinuedDrug) {
                    var removableOrder = _.find(activeDrugOrdersList, {uuid: discontinuedDrug.uuid});
                    if(discontinuedDrug != null) {
                    removableOrder.orderReasonText = discontinuedDrug.orderReasonText;
                    removableOrder.dateActivated=discontinuedDrug.dateStopped;
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
                });
            };
            $scope.consultation.preSaveHandler.register("drugOrderSaveHandlerKey", saveTreatment);

            $scope.shouldBeDisabled = function (drugOrder, orderAttribute) {
                var hasEncounterExpired = function () {
                    return !($scope.consultation.encounterUuid === orderAttribute.encounterUuid);
                };
                var isAlreadySaved = function () {
                    return orderAttribute.obsUuid
                };
                return !drugOrder.isActive() || (isAlreadySaved() && hasEncounterExpired());
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
                    if (!$scope.shouldBeDisabled(drugOrder, orderAttributeOfName) && !orderAttributeOfName.value)
                        allAttributesSelected = false;
                });
                drugOrderGroup[orderAttributeName] = drugOrderGroup[orderAttributeName] || {};
                drugOrderGroup[orderAttributeName].selected = allAttributesSelected;
            };

            $scope.canUpdateAtLeastOneOrderAttributeOfName = function (drugOrderGroup, orderAttributeName) {
                var canBeUpdated = false;
                drugOrderGroup.drugOrders.forEach(function (drugOrder) {
                    var orderAttributeOfName = getAttribute(drugOrder, orderAttributeName);
                    if (!$scope.shouldBeDisabled(drugOrder, orderAttributeOfName)) canBeUpdated = true;
                });
                return canBeUpdated;
            };

            var getAttribute = function (drugOrder, attributeName) {
                return _.find(drugOrder.orderAttributes, {name: attributeName});
            };


            $scope.dashboard = Bahmni.Common.DisplayControl.Dashboard.create(drugOrderAppConfig || {});
            $scope.sectionGroups =  $scope.dashboard.getSections();

            init();
        }]);
