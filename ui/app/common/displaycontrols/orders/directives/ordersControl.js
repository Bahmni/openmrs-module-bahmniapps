'use strict';

angular.module('bahmni.common.displaycontrol.orders')
    .directive('ordersControl', ['orderService', 'orderTypeService', '$q','spinner', '$filter',
        function (orderService, orderTypeService, $q, spinner, $filter) {
            var controller = function($scope){
                $scope.orderTypeUuid = orderTypeService.getOrderTypeUuid($scope.orderType);
                if ($scope.config.showHeader === null || $scope.config.showHeader === undefined) {
                    $scope.config.showHeader = true;
                }

                var includeAllObs = true;
                var getOrders = function () {
                    return orderService.getOrders($scope.patient.uuid, $scope.orderTypeUuid, $scope.config.conceptNames, includeAllObs, $scope.config.numberOfVisits,
                        $scope.config.obsIgnoreList, $scope.visitUuid, $scope.orderUuid).then(function (response) {
                            $scope.bahmniOrders = response.data;
                        });
                };
                var init = function() {
                    return getOrders().then(function(){
                        _.forEach($scope.bahmniOrders, function(order){
                            if(order.bahmniObservations.length === 0){
                                order.hideIfEmpty = true
                            }
                        });
                        if (_.isEmpty($scope.bahmniOrders)) {
                            $scope.noOrdersMessage = "No "+$scope.orderType+" for this patient";
                        }
                        else{
                            $scope.bahmniOrders[0].isOpen = true;
                        }
                    });
                };
                $scope.getTitle = function(order){
                        return order.conceptName + " on " + $filter('bahmniDateTime')(order.orderDate) + " by " + order.provider;
                };

                $scope.toggle= function(element){
                    element.isOpen = !element.isOpen;
                };

                $scope.dialogData = {
                    "patient": $scope.patient,
                    "section": $scope.section
                };

                $scope.isClickable= function(){
                    return $scope.isOnDashboard && $scope.section.allOrdersDetails;
                };

                $scope.message = Bahmni.Common.Constants.messageForNoFulfillment;

                $scope.getSectionTitle = function(){
                    return $scope.sectionTitle ? $scope.sectionTitle : $scope.section.title
                }

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
                    isOnDashboard:"=",
                    visitUuid:"=",
                    sectionTitle:"="
                }
            }
        }]);
