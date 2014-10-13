'use strict';

angular.module('bahmni.clinical')
    .controller('DrugOrderHistoryController', ['$scope', '$rootScope', '$filter', 'prescribedDrugOrders', 'RegisterTabService', 'contextChangeHandler', function ($scope, $rootScope, $filter, prescribedDrugOrders, registerTabService, contextChangeHandler) {
        var DrugOrderViewModel = Bahmni.Clinical.DrugOrderViewModel;

        var createPrescribedDrugOrderGroups = function () {
            var drugOrderGroups = _.groupBy(prescribedDrugOrders, function (drugOrder) { return drugOrder.visit.startDateTime; });
            angular.forEach(drugOrderGroups,function(drugOrders, visitStartDate){
                drugOrderGroups[visitStartDate] = drugOrders.map(DrugOrderViewModel.createFromContract);
            });
            return drugOrderGroups;
        };

        var init = function () {
            $scope.consultation.discontinuedDurgs = $scope.consultation.discontinuedDurgs || [];
            $scope.consultation.drugOrderGroups = $scope.consultation.drugOrderGroups || createPrescribedDrugOrderGroups();
            $scope.drugOrderGroupOrder = Object.keys($scope.consultation.drugOrderGroups).sort(function(a, b){return a < b});
        };

        $scope.toggleShowAdditionalInstructions = function (line) {
            line.showAdditionalInstructions = !line.showAdditionalInstructions;
        };

        $scope.drugOrderGroupsEmpty = function(){
            return _.isEmpty($scope.drugOrderGroupOrder);
        };

        $scope.showEffectiveFromDate = function(visitStartDate, effectiveStartDate) {
            return $filter("date")(effectiveStartDate, 'dd MMM yy') !== $filter("date")(visitStartDate, 'dd MMM yy');
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

        $scope.remove = function(drugOrder){
            if(drugOrder.isDiscontinuedAllowed){
                drugOrder.action = Bahmni.Clinical.Constants.orderActions.discontinue;
                drugOrder.isEditAllowed = false;
                $scope.consultation.discontinuedDurgs.push(drugOrder);
            }
        };

        $scope.undoRemove = function(drugOrder){
            $scope.consultation.discontinuedDurgs = _.reject($scope.consultation.discontinuedDurgs, function(removableOrder){
                return removableOrder.uuid === drugOrder.uuid;
            });
            drugOrder.action = Bahmni.Clinical.Constants.orderActions.new;
            drugOrder.isEditAllowed = true;
        };

        var saveTreatment = function () {
            $scope.consultation.discontinuedDurgs.forEach(function (discontinuedDrug) {
                var removableOrder = _.find(prescribedDrugOrders, function (prescribedOrder) {
                    return prescribedOrder.uuid === discontinuedDrug.uuid;
                });
                removableOrder.action = Bahmni.Clinical.Constants.orderActions.discontinue;
                removableOrder.previousOrderUuid = removableOrder.uuid;
                removableOrder.uuid = undefined;
                removableOrder.dateActivated = null;
                $rootScope.consultation.drugOrders.push(removableOrder);
            });
        };
        registerTabService.register(saveTreatment);

        init();
    }]);