"use strict";

var app = angular.module('bahmni.orders');
app.controller('OrderFulfillmentController', ['$scope', '$rootScope', '$stateParams', 'patientContext', 'orderService', 'orderTypeService', function ($scope, $rootScope, $stateParams, patientContext, orderService, orderTypeService) {

    orderService.getOrders(patientContext.patient.uuid, orderTypeService.getOrderTypeUuid($stateParams.orderType)).success(function(response) {
        $scope.orders = response.results;
    });
}]);