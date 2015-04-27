"use strict";

angular.module('bahmni.clinical')
    .directive('orderSelector', [function () {

            var link = function($scope, element, attrs) {
                $scope.hasOrders = function() {
                    return $scope.rootConcept && !(_.isUndefined($scope.rootConcept.setMembers)) && $scope.rootConcept.setMembers.length > 0;
                };

                $scope.filterByConceptClass = function(test) {
                    checkIfTestSelected(test);
                    return test.conceptClass.name == $scope.conceptClass;
                };

                var checkIfTestSelected = function(test){
                    test.isSelected = $scope.orders.some(function(order) {
                        return !order.voided && order.concept.uuid == test.uuid;
                    });
                };

                $scope.onSelectionChange = function(test){
                    test.isSelected = !test.isSelected;
                    if(test.isSelected) {
                        var order = Bahmni.Clinical.Order.create(test);
                        $scope.orders.push(order);
                    }
                    else {
                        var order = _.find($scope.orders, function(order) {
                            return order.concept.uuid === test.uuid;
                        });
    
                        if (order.uuid) {
                            order.voided = true;
                        }
                        else {
                            removeOrder(order);
                        }
                    }
                };

                var removeOrder = function(order){
                    _.remove($scope.orders, function(o){
                        return o.concept.uuid == order.concept.uuid;
                    });
                };
            };

            return {
                restrict:'E',
                replace: true,
                link: link,
                templateUrl: './consultation/views/orderSelector.html',
                scope: {
                    consultation: "=",
                    orders: "=",
                    conceptClass: "=",
                    rootConcept: "=",
                    title: "="
                }
            };
        }]);