'use strict';

angular.module('bahmni.common.displaycontrol.pacsOrders')
    .directive('pacsOrders', ['orderService', 'orderTypeService', 'spinner',
        function(orderService, orderTypeService, spinner){
            var controller = function($scope){
                $scope.orderTypeUuid = orderTypeService.getOrderTypeUuid($scope.orderType);

                var includeAllObs = true;
                var getOrders = function () {
                    var params = {
                        patientUuid:$scope.patient.uuid,
                        orderTypeUuid:$scope.orderTypeUuid,
                        conceptNames:$scope.config.conceptNames,
                        includeObs:includeAllObs,
                        numberOfVisits:$scope.config.numberOfVisits,
                        obsIgnoreList:$scope.config.obsIgnoreList,
                        visitUuid:$scope.visitUuid,
                        orderUuid:$scope.orderUuid
                    };
                    return orderService.getOrders(params).then(function (response) {
                            $scope.bahmniOrders = response.data;
                        });
                };
                var init = function() {
                    return getOrders().then(function(){
                        if (_.isEmpty($scope.bahmniOrders)) {
                            $scope.noOrdersMessage = "No "+$scope.orderType+" for this patient.";
                        }
                    });
                };

                $scope.getUrl = function(orderNumber){
                    var pacsImageTemplate = $scope.config.pacsImageUrl||"";
                    return pacsImageTemplate
                        .replace('{{patientID}}',$scope.patient.identifier)
                        .replace('{{orderNumber}}',orderNumber);
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