'use strict';

angular.module('bahmni.common.displaycontrol.orders')
    .directive('ordersControl', ['orderService', 'orderTypeService', '$q','spinner', '$filter',
        function (orderService, orderTypeService, $q, spinner, $filter) {
            var controller = function($scope){
                $scope.orderTypeUuid = orderTypeService.getOrderTypeUuid($scope.orderType);
                var includeAllObs = true;
                var getOrders = function() {
                    return orderService.getOrders($scope.patient.uuid, $scope.orderTypeUuid, $scope.config.conceptNames, includeAllObs, $scope.config.numberOfVisits,
                       $scope.config.obsIgnoreList, $scope.visitUuid, $scope.orderUuid).then(function(response) {
                       $scope.bahmniOrders = response.data;
                    });
                };
                var init = function() {
                    return getOrders().then(function(){
                    });
                };
                $scope.getTitle = function(order){
                        return order.conceptName + " on " + $filter('bahmniDateTime')(order.orderDate) + " by " + order.provider;
                };

                $scope.toggle= function(element){
                    element.isOpen = !element.isOpen;
                };

                $scope.message = Bahmni.Common.Constants.messageForNoFulfillment;

                spinner.forPromise(init());
            };
            return {
                restrict:'E',
                controller: controller,
                templateUrl:"../common/displaycontrols/orders/views/ordersControl.html",
                scope:{
                    patient:"=",
                    section:"=",
                    orderType:"=",
                    orderUuid:"=",
                    config:"=",
                    visitUuid:"="
                }
            }
        }]);
