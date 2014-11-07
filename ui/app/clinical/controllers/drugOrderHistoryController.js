'use strict';

angular.module('bahmni.clinical')
    .controller('DrugOrderHistoryController', ['$scope', '$rootScope', '$filter', '$stateParams', 'prescribedDrugOrders',
        'treatmentConfig', 'TreatmentService', 'spinner', 'appService',
        function ($scope, $rootScope, $filter, $stateParams, prescribedDrugOrders, treatmentConfig, treatmentService, spinner, appService) {

            var DrugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel;
            var DateUtil = Bahmni.Common.Util.DateUtil;
            var currentVisit = $rootScope.visit;
            var drugOrderAppConfig = appService.getAppDescriptor().getConfigValue("drugOrder") || {};

            var dateCompare = function (drugOrder1, drugOrder2) {
                return drugOrder1.effectiveStartDate > drugOrder2.effectiveStartDate ? -1 : 1;
            };

            var createPrescriptionGroups = function () {
                return treatmentService.getActiveDrugOrders($stateParams.patientUuid).then(function (drugOrders) {
                    var activeDrugOrders = [];
                    drugOrders.forEach(function (drugOrder) {
                        activeDrugOrders.push(DrugOrderViewModel.createFromContract(drugOrder))
                    });
                    activeDrugOrders = activeDrugOrders.sort(dateCompare);
                    activeDrugOrders = _.filter(activeDrugOrders, function (activeDrugOrder) {
                        return new Date(activeDrugOrder.scheduledDate) <= DateUtil.now();
                    });
                    $scope.consultation.drugOrderGroups = [];
                    createPrescribedDrugOrderGroups();
                    createActiveAndLastVisitDrugOrderGroup(activeDrugOrders);
                });
            };

            var createPrescribedDrugOrderGroups = function () {
                if (prescribedDrugOrders.length == 0) return [];
                var drugOrderGroupedByDate = _.groupBy(prescribedDrugOrders, function (drugOrder) {
                    return DateUtil.parse(drugOrder.visit.startDateTime);
                });

                var createDrugOrder = function(drugOrder) {
                    return DrugOrderViewModel.createFromContract(drugOrder, drugOrderAppConfig, treatmentConfig);
                }

                var drugOrderGroups = _.map(drugOrderGroupedByDate, function (drugOrders, visitStartDate) {
                    return {
                        label: $filter("date")(DateUtil.parse(visitStartDate), 'dd MMM yy'),
                        visitStartDate: DateUtil.parse(visitStartDate),
                            drugOrders: drugOrders.map(createDrugOrder),
                        isCurrentVisit: currentVisit && DateUtil.isSameDateTime(visitStartDate, currentVisit.startDate)
                    }
                });
                $scope.consultation.drugOrderGroups = $scope.consultation.drugOrderGroups.concat(drugOrderGroups);
            };

            var createActiveAndLastVisitDrugOrderGroup = function(activeDrugOrders) {
                $scope.consultation.drugOrderGroups = _.sortBy($scope.consultation.drugOrderGroups, 'visitStartDate').reverse();
                var recentDrugOrders = activeDrugOrders.concat($scope.consultation.drugOrderGroups[0].drugOrders);
                $scope.consultation.drugOrderGroups.unshift({label: 'Recent', drugOrders: recentDrugOrders, selected: true, firstSectionLength: activeDrugOrders.length});
            };

            var init = function () {
                $scope.consultation.discontinuedDrugs = $scope.consultation.discontinuedDrugs || [];
                if (!$scope.consultation.drugOrderGroups) {
                    spinner.forPromise(createPrescriptionGroups());
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

            $scope.edit = function (drugOrder, drugOrders) {
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
                drugOrder.isMarkedForDiscontinue = false;
                drugOrder.isEditAllowed = true;
            };

            var removeOrder = function (removableOrder) {
                removableOrder.action = Bahmni.Clinical.Constants.orderActions.discontinue;
                removableOrder.previousOrderUuid = removableOrder.uuid;
                removableOrder.uuid = undefined;
                removableOrder.dateActivated = null;
                $rootScope.consultation.drugOrders.push(removableOrder);
            };

            var saveTreatment = function () {
                $scope.consultation.discontinuedDrugs.forEach(function (discontinuedDrug) {
                    var removableOrder = _.find(prescribedDrugOrders, function (prescribedOrder) {
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