'use strict';

angular.module('bahmni.clinical')
    .controller('DrugOrderHistoryController', ['$scope', '$rootScope', '$filter', 'prescribedDrugOrders', 'RegisterTabService', 'treatmentConfig', function ($scope, $rootScope, $filter, prescribedDrugOrders, registerTabService, treatmentConfig) {
        
        var DrugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel;
        var DateUtil = Bahmni.Common.Util.DateUtil;
        var currentVisit = $rootScope.visit;

        var createPrescribedDrugOrderGroups = function () {
            if(prescribedDrugOrders.length == 0) return [];
            var drugOrderGroupedByDate = _.groupBy(prescribedDrugOrders, function (drugOrder) { return DateUtil.parse(drugOrder.visit.startDateTime); });
            var newDrugOrder = function(drugOrder) {
                return DrugOrderViewModel.createFromContract(drugOrder, $scope.currentBoard.extensionParams, treatmentConfig);
            };
            var drugOrderGroups = _.map(drugOrderGroupedByDate, function(drugOrders, visitStartDate){
                return {
                    label: $filter("date")(DateUtil.parse(visitStartDate), 'dd MMM yy'),
                    visitStartDate: DateUtil.parse(visitStartDate),
                    drugOrders: drugOrders.map(newDrugOrder),
                    isCurrentVisit: currentVisit && DateUtil.isSameDateTime(visitStartDate, currentVisit.startDate)
                }
            });
            var drugOrderGroupToSelect = _.find(drugOrderGroups, {isCurrentVisit: true}) || drugOrderGroups[0];
            drugOrderGroupToSelect.selected = true;
            var activeDrugOrders = _.where(_.flatten(_.collect(drugOrderGroups, 'drugOrders')), function(order) { return order.isActive(); })
            drugOrderGroups.push({label: 'Active', drugOrders: activeDrugOrders});
            return drugOrderGroups;
        };

        var init = function () {
            $scope.consultation.discontinuedDrugs = $scope.consultation.discontinuedDrugs || [];
            $scope.consultation.drugOrderGroups = $scope.consultation.drugOrderGroups || createPrescribedDrugOrderGroups();
        };

        $scope.toggleShowAdditionalInstructions = function (line) {
            line.showAdditionalInstructions = !line.showAdditionalInstructions;
        };

        $scope.drugOrderGroupsEmpty = function(){
            return _.isEmpty($scope.consultation.drugOrderGroups);
        };

        $scope.isDrugOrderGroupEmpty = function(drugOrders){
            return _.isEmpty(drugOrders);
        };

        $scope.showEffectiveFromDate = function(visitStartDate, effectiveStartDate) {
            return $filter("date")(effectiveStartDate, 'dd MMM yy') !== $filter("date")(visitStartDate, 'dd MMM yy');
        };

        $scope.refill = function(drugOrder) {
            $rootScope.$emit("event:refillDrugOrder", drugOrder);
        };
        
        $scope.refillAll = function(drugOrders) {
            $rootScope.$emit("event:refillDrugOrders", drugOrders);
        };
        
        $scope.edit = function(drugOrder, drugOrders){
            if(drugOrder.isEditAllowed){
                drugOrders.forEach(function(drugOrder){
                    drugOrder.isDiscontinuedAllowed = true;
                    drugOrder.isBeingEdited = false;
                });
                drugOrder.isDiscontinuedAllowed = false;
                drugOrder.isBeingEdited = true;
                $rootScope.$emit("event:reviseDrugOrder", drugOrder);
            }
        };

        $scope.discontinue = function(drugOrder){
            if(drugOrder.isDiscontinuedAllowed){
                drugOrder.isMarkedForDiscontinue = true;
                drugOrder.isEditAllowed = false;
                $scope.consultation.discontinuedDrugs.push(drugOrder);
            }
        };

        $scope.undoDiscontinue = function(drugOrder){
            $scope.consultation.discontinuedDrugs = _.reject($scope.consultation.discontinuedDrugs, function(removableOrder){
                return removableOrder.uuid === drugOrder.uuid;
            });
            drugOrder.isMarkedForDiscontinue = false;
            drugOrder.isEditAllowed = true;
        };

        var removeOrder = function(removableOrder) {
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
        registerTabService.register(saveTreatment);

        init();
    }]);