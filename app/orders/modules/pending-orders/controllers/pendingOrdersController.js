"use strict";

angular.module('orders.pending.controllers')
    .controller('PendingOrdersController', ['$scope','$routeParams', 'PendingOrderService', function ($scope,$routeParams, pendingOrderService) {
    	
    	$scope.getOrders = function (patientUuid, orderTypeUuid) {
    		pendingOrderService.getOrders(patientUuid, orderTypeUuid).success(function(response){
    			$scope.orders = response.results;
    		});
    	}

    	var patientUuid = $routeParams.patientUuid;
    	var orderTypeUuid = $routeParams.orderTypeUuid;
    	$scope.getOrders(patientUuid,orderTypeUuid);
}]);
