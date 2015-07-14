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
                        return !order.isDiscontinued && order.concept.uuid == test.uuid;
                    });

                    if (test.isSelected) {
                        selectChildTests(test);
                    }
                };

                $scope.onSelectionChange = function(test){
                    test.isSelected = !test.isSelected;
                    var order = _.find($scope.orders, function(order) {
                        return order.concept.uuid === test.uuid;
                    });
                    if(test.isSelected) {
                        if(order && order.isDiscontinued) {
                            order.isDiscontinued = false;
                        }
                        else{
                            var newOrder = Bahmni.Clinical.Order.create(test);
                            $scope.orders.push(newOrder);
                        }
                    }
                    else {
                        if (order.uuid) {
                            order.isDiscontinued = true;
                        }
                        else {
                            removeOrder(order);
                        }
                        removeChildTests(test);
                    }
                };

                $scope.getName = function (test) {
                    var name = _.find(test.names, {conceptNameType: "SHORT"}) || _.find(test.names, {conceptNameType: "FULLY_SPECIFIED"});
                    return name ? name.name : undefined;
                };

                var removeOrder = function(order){
                    _.remove($scope.orders, function(o){
                        return o.concept.uuid == order.concept.uuid;
                    });
                };

                var selectChildTests = function (test) {
                    if (test.setMembers) {
                        _.forEach(test.setMembers, function (child) {
                            $scope.childOrders.push(child);
                        });
                    }
                };

                $scope.isChildTest = function (test) {
                    var result = $scope.childOrders.some(function (o) {
                        return o.uuid == test.uuid;
                    });

                    return result;
                };

                var removeChildTests = function (test) {
                    if (test.setMembers) {
                        _.forEach(test.setMembers, function (child) {
                            _.remove($scope.childOrders, function (o) {
                                return o.uuid === child.uuid;
                            });
                        });
                    }
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
                    childOrders: "=",
                    conceptClass: "=",
                    rootConcept: "=",
                    title: "="
                }
            };
        }]);