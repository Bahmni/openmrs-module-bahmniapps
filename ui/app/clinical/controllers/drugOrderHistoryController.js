'use strict';

angular.module('bahmni.clinical')
    .controller('DrugOrderHistoryController', ['$scope', '$rootScope', '$filter', 'prescribedDrugOrders', 'RegisterTabService', 'contextChangeHandler', function ($scope, $rootScope, $filter, prescribedDrugOrders, registerTabService, contextChangeHandler) {
        $scope.removableDrugs = [];
        var groupedDrugOrders = function (drugOrders) {
            return _.groupBy(drugOrders, function (drugOrder) {
                return drugOrder.visit.startDateTime;
            });
        };

        var init = function () {
            if(!$rootScope.drugOrderGroups){
                var drugOrderGroups = groupedDrugOrders(prescribedDrugOrders);
                angular.forEach(drugOrderGroups,function(drugOrders, key){
                    drugOrderGroups[key] = drugOrders.map(function(drugOrder) {return Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder)});
                });
                $scope.drugOrderGroups = drugOrderGroups;
            }else{
                $scope.drugOrderGroups = $rootScope.drugOrderGroups;
            }
            $scope.drugOrderGroupOrder = Object.keys($scope.drugOrderGroups).sort(function(a, b){return a < b});
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

        $scope.edit = function(drugOrder){
            $rootScope.$emit("event:reviseDrugOrder", drugOrder);
        };

        $scope.remove = function(drugOrder){
            drugOrder.action = Bahmni.Clinical.Constants.orderActions.discontinue;
            $scope.removableDrugs.push(drugOrder);
        };

        $scope.undoRemove = function(drugOrder){
            $scope.removableDrugs = _.reject($scope.removableDrugs, function(removableOrder){
                return removableOrder.uuid === drugOrder.uuid;
            });
            drugOrder.action = Bahmni.Clinical.Constants.orderActions.new;
        };

        var saveTreatment = function () {
            $rootScope.discontinuedDurgs.forEach(function (discontinuedDrug) {
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

        var allowContextChange = function () {
            $rootScope.discontinuedDurgs = $scope.removableDrugs;
            $rootScope.drugOrderGroups = $scope.drugOrderGroups;
            return true;
        };

        contextChangeHandler.add(allowContextChange);
    }]);