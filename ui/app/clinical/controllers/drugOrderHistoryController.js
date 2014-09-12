'use strict';

angular.module('bahmni.clinical')
    .controller('DrugOrderHistoryController', ['$scope','$filter', 'prescribedDrugOrders', function ($scope, $filter, prescribedDrugOrders) {
        var visitStartDateFormat = 'dd MMM yy';
        var groupedDrugOrders = function (drugOrders) {
            return _.groupBy(drugOrders, function (drugOrder) {
                return $filter("date")(drugOrder.visit.startDateTime, visitStartDateFormat);
            });
        };

        var init = function () {
            var drugOrderGroups = groupedDrugOrders(prescribedDrugOrders);
            angular.forEach(drugOrderGroups,function(drugOrders, key){
                drugOrderGroups[key] = drugOrders.map(function(drugOrder) {return Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder)});
            });
            $scope.drugOrderGroups = drugOrderGroups;
            $scope.drugOrderGroupOrder = Object.keys($scope.drugOrderGroups).sort(function(a, b){return a < b});

        };

        $scope.toggleShowAdditionalInstructions = function (line) {
            line.showAdditionalInstructions = !line.showAdditionalInstructions;
        };

        $scope.drugOrderGroupsEmpty = function(){
            return _.isEmpty($scope.drugOrderGroupOrder);
        };

        $scope.showEffectiveFromDate = function(visitStartDate, effectiveStartDate) {
            return $filter("date")(effectiveStartDate, visitStartDateFormat) !== visitStartDate;
        };

        init();
    }]);