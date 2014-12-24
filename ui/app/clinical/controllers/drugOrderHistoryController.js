'use strict';

angular.module('bahmni.clinical')
    .controller('DrugOrderHistoryController', ['$scope', '$rootScope', '$filter', '$stateParams', 'prescribedDrugOrders',
        'treatmentConfig', 'TreatmentService', 'spinner', 'clinicalAppConfigService',
        function ($scope, $rootScope, $filter, $stateParams, prescribedDrugOrders, treatmentConfig, treatmentService, spinner, clinicalAppConfigService) {
            
            var DrugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel;
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var currentVisit = $rootScope.visit;
            var drugOrderAppConfig = clinicalAppConfigService.getDrugOrderConfig();
            var activeDrugOrdersList = [];

            var createPrescriptionGroups = function (activeAndScheduledDrugOrders) {
                $scope.consultation.drugOrderGroups = [];

                createPrescribedDrugOrderGroups();
                createRecentDrugOrderGroup(activeAndScheduledDrugOrders);
            };

            var getRefillableDrugOrders = function(activeAndScheduledDrugOrders) {
                activeAndScheduledDrugOrders = _(activeAndScheduledDrugOrders).chain().sortBy('orderNumber').reverse().sortBy('effectiveStartDate').reverse().value();
                var refillableDrugOrders = activeAndScheduledDrugOrders;

                var previousVisitDrugOrders = _(getPreviousVisitDrugOrders()).chain().sortBy('orderNumber').reverse().sortBy('effectiveStartDate').reverse().value();
                _.each(previousVisitDrugOrders, function(previousVisitDrugOrder){
                    var isActiveOrScheduled = _.find(activeAndScheduledDrugOrders, function(activeOrScheduledDrugOrder){
                        return previousVisitDrugOrder.drug.uuid === activeOrScheduledDrugOrder.drug.uuid;
                    });
                    if(!isActiveOrScheduled){
                        refillableDrugOrders.push(previousVisitDrugOrder);
                    }
                });
                return refillableDrugOrders;
            };

            var getPreviousVisitDrugOrders = function(){
                var currentVisitIndex = _.findIndex($scope.consultation.drugOrderGroups, function(group){
                    return group.isCurrentVisit;
                });

                if($scope.consultation.drugOrderGroups[currentVisitIndex+1]) {
                    return $scope.consultation.drugOrderGroups[currentVisitIndex+1].drugOrders;
                }
                return [];
            };

            var createRecentDrugOrderGroup = function(activeAndScheduledDrugOrders){
                var refillableGroup = {
                    label: 'Recent',
                    selected: true,
                    drugOrders: getRefillableDrugOrders(activeAndScheduledDrugOrders)
                };
                $scope.consultation.drugOrderGroups.unshift(refillableGroup);
            };

            var createPrescribedDrugOrderGroups = function () {
                if (prescribedDrugOrders.length == 0) return [];
                var sortedDrugOrders = _.sortBy(prescribedDrugOrders, 'orderNumber');
                var drugOrderGroupedByDate = _.groupBy(sortedDrugOrders, function (drugOrder) {
                    return DateUtil.parse(drugOrder.visit.startDateTime);
                });

                var createDrugOrder = function(drugOrder) {
                    return DrugOrderViewModel.createFromContract(drugOrder, drugOrderAppConfig, treatmentConfig);
                };

                var drugOrderGroups = _.map(drugOrderGroupedByDate, function (drugOrders, visitStartDate) {
                    return {
                        label: $filter("date")(DateUtil.parse(visitStartDate), 'dd MMM yy'),
                        visitStartDate: DateUtil.parse(visitStartDate),
                            drugOrders: drugOrders.map(createDrugOrder),
                        isCurrentVisit: currentVisit && DateUtil.isSameDateTime(visitStartDate, currentVisit.startDate)
                    }
                });
                $scope.consultation.drugOrderGroups = $scope.consultation.drugOrderGroups.concat(drugOrderGroups);
                $scope.consultation.drugOrderGroups = _.sortBy($scope.consultation.drugOrderGroups, 'visitStartDate').reverse();
            };

            var getActiveDrugOrders = function() {
                return treatmentService.getActiveDrugOrders($stateParams.patientUuid).then(function (drugOrders) {
                    activeDrugOrdersList = drugOrders || [];
                    return activeDrugOrdersList.map(function (drugOrder) {
                        return DrugOrderViewModel.createFromContract(drugOrder, drugOrderAppConfig,treatmentConfig);
                    });
                });
            };

            var init = function () {
                $scope.consultation.removableDrugs = $scope.consultation.removableDrugs || [];
                $scope.consultation.discontinuedDrugs = $scope.consultation.discontinuedDrugs || [];
                if (!$scope.consultation.drugOrderGroups) {
                    spinner.forPromise(getActiveDrugOrders().then(function(data){
                        $rootScope.activeAndScheduledDrugOrders = data;
                        createPrescriptionGroups(data)
                    }));
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
                return $filter("date")(effectiveStartDate, 'dd MMM yy') !== $filter("date")(visitStartDate, 'dd MMM yy');
            };

            $scope.refill = function (drugOrder) {
                $rootScope.$broadcast("event:refillDrugOrder", drugOrder);
            };

            $scope.refillAll = function (drugOrders) {
                $rootScope.$broadcast("event:refillDrugOrders", drugOrders);
            };

            $scope.revise = function (drugOrder, drugOrders) {
                if (drugOrder.isEditAllowed) {
                    drugOrders.forEach(function (drugOrder) {
                        drugOrder.isDiscontinuedAllowed = true;
                        drugOrder.isBeingEdited = false;
                    });
                    drugOrder.isDiscontinuedAllowed = false;
                    drugOrder.isBeingEdited = true;
                    $rootScope.$broadcast("event:reviseDrugOrder", drugOrder);
                }
            };

            $scope.discontinue = function (drugOrder) {
                if (drugOrder.isDiscontinuedAllowed) {
                    drugOrder.isMarkedForDiscontinue = true;
                    drugOrder.isEditAllowed = false;
                    $scope.consultation.discontinuedDrugs.push(drugOrder);
                }
            };

            $scope.undoDiscontinue = function (drugOrder) {
                $scope.consultation.discontinuedDrugs = _.reject($scope.consultation.discontinuedDrugs, function (removableOrder) {
                    return removableOrder.uuid === drugOrder.uuid;
                });
                $scope.consultation.removableDrugs = _.reject($scope.consultation.removableDrugs, function (removableOrder) {
                    return removableOrder.previousOrderUuid === drugOrder.uuid;
                });

                drugOrder.isMarkedForDiscontinue = false;
                drugOrder.isEditAllowed = true;
            };

            var removeOrder = function (removableOrder) {
                removableOrder.action = Bahmni.Clinical.Constants.orderActions.discontinue;
                removableOrder.previousOrderUuid = removableOrder.uuid;
                removableOrder.uuid = undefined;
                removableOrder.dateActivated = null;
                $scope.consultation.removableDrugs.push(removableOrder);
            };

            var saveTreatment = function () {
                $scope.consultation.discontinuedDrugs.forEach(function (discontinuedDrug) {
                    var removableOrder = _.find(activeDrugOrdersList, function (prescribedOrder) {
                        return prescribedOrder.uuid === discontinuedDrug.uuid;
                    });
                    if (removableOrder) {
                        removeOrder(removableOrder);
                    }
                });
            };
            $scope.consultation.saveHandler.register(saveTreatment);

            init();
        }]);