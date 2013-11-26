"use strict";

angular.module('orders.pending.controllers')
    .controller('PendingOrdersController', ['$scope','$route', '$routeParams', 'PendingOrderService', function ($scope,$route,$routeParams, pendingOrderService) {

    	$scope.getOrders = function (patientUuid, orderTypeUuid) {
    		pendingOrderService.getOrders(patientUuid, orderTypeUuid).success(function(response){
    			$scope.orders = response.results;
    		});
    	};

        var constructEncounterTransactionObject = function(order){
            var orderUuid = order.uuid;
            var visitUuid = order.encounter.visit.uuid;
            var patientUuid = $routeParams.patientUuid;
            var encounterTypeUuid = $scope.encounterTypes[Bahmni.Common.Constants.investigationEncounterType];
            var resultConceptUuid = $scope.radiologyObservationConcept.uuid;
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


        $scope.toggleResultsEntry = function(index){
            $scope.resultsEntry[index] = $scope.resultsEntry[index]?false:true;
        }

        $scope.saveResult = function(order){
            var encounterTransactionObj = constructEncounterTransactionObject(order);
            pendingOrderService.saveOrderResult(encounterTransactionObj).success(function() {
                $route.reload();
            });


        };


    	var patientUuid = $routeParams.patientUuid;
    	var orderTypeUuid = $routeParams.orderTypeUuid;
        $scope.resultsEntry = [];
    	$scope.getOrders(patientUuid,orderTypeUuid);
}]);
