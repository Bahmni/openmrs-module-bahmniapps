'use strict';

angular.module('bahmni.common.displaycontrol.pacsOrders')
    .directive('pacsOrders', ['orderService', 'orderTypeService', '$q','spinner', '$filter',
        function(orderService, orderTypeService, $q, spinner, $filter){
            var controller = function($scope){
                $scope.orderTypeUuid = orderTypeService.getOrderTypeUuid($scope.orderType);

                var includeAllObs = true;
                var getOrders = function () {
                    return orderService.getOrders($scope.patient.uuid,$scope.orderTypeUuid,$scope.config.conceptNames,includeAllObs,$scope.config.numberOfVisits,$scope.config.obsIgnoreList,$scope.visitUuid,$scope.orderUuid).then(function (response) {
                            $scope.bahmniOrders = response.data;
                        });
                };
                var init = function() {
                    return getOrders().then(function(){
                        if (_.isEmpty($scope.bahmniOrders)) {
                            $scope.noOrdersMessage = "No "+$scope.orderType+" for this patient";
                        }
                    });
                };

                spinner.forPromise(init());
            };

            return {
                restrict:'E',
                controller: controller,
                templateUrl:"../common/displaycontrols/pacsOrders/views/pacsOrders.html",
                scope:{
                    patient:"=",
                    section:"=",
                    orderType:"=",
                    orderUuid:"=",
                    config:"=",
                    visitUuid:"="
                }
            }
        }
    ]);