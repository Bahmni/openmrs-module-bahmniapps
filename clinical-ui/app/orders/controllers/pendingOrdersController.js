"use strict";

angular.module('orders.pending')
    .controller('PendingOrdersController', ['$scope','$rootScope','$route', '$routeParams', 'PendingOrderService','$q', function ($scope,$rootScope,$route,$routeParams, pendingOrderService,$q) {

    	$scope.getOrders = function (patientUuid, orderTypeUuid) {
            var results =[];
    		pendingOrderService.getOrders(patientUuid, orderTypeUuid).success(function(response){
    			return response.results;
    		});
    	};

        var constructEncounterTransactionObject = function(order){
            var orderUuid = order.uuid;
            var visitUuid = order.encounter.visit.uuid;
            var patientUuid = $routeParams.patientUuid;
            var encounterTypeUuid = $scope.encounterTypes[Bahmni.Common.Constants.investigationEncounterType];
            var resultConceptUuid = order.concept.uuid;
            var resultValue = order.resultText;

            var encounterTransaction = {
                visitUuid : visitUuid,
                encounterTypeUuid : encounterTypeUuid,
                patientUuid:patientUuid,
                observations:[
                    {
                        concept:{
                            uuid : resultConceptUuid
                        },
                        value:resultValue,
                        orderUuid:orderUuid
                    }
                ]
            };
            return encounterTransaction;
        };


        $scope.toggleResultsEntry = function(toggleOrderUuid){
            $scope.resultsEntry[toggleOrderUuid] = $scope.resultsEntry[toggleOrderUuid]?false:true;
        }

        $scope.saveResult = function(order){
            var encounterTransactionObj = constructEncounterTransactionObject(order);
            pendingOrderService.saveOrderResult(encounterTransactionObj).success(function() {
                $route.reload();
            });


        };
        var getResults = function() {
            var patientUuid = $routeParams.patientUuid;
            var orderTypeUuid = $routeParams.orderTypeUuid;
            $scope.resultsEntry = {};
            $rootScope.availableBoards = [
                { name: 'Pending Orders', url: ''}
            ];
            $rootScope.currentBoard = $scope.availableBoards[0];
            var nonLabOrderTypes = [];
            Object.keys($rootScope.orderTypes).forEach(function(orderTypeKey) {
                if (orderTypeKey != "Drug Order" && orderTypeKey != "Lab Order") {
                    nonLabOrderTypes[orderTypeKey] = $rootScope.orderTypes[orderTypeKey]
                }
            });
            var getOrdersPromises ={};
            for(var key in nonLabOrderTypes) {
                getOrdersPromises[key] = pendingOrderService.getOrders(patientUuid, nonLabOrderTypes[key])
            }
            return $q.all(getOrdersPromises);
        };

        $scope.orders = {};
        getResults().then(function(results){
            for(var key in results) {
                $scope.orders[key] = results[key];
            }
        });
        
        
}]);
