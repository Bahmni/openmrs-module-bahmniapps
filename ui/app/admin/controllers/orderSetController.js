'use strict';


angular.module('bahmni.common.domain')
    .controller('OrderSetController', ['$scope', '$state', 'spinner', '$http', 'orderSetService', 'messagingService', 'orderTypeInitialization',
        function ($scope, $state, spinner, $http, orderSetService, messagingService, orderTypeInitialization) {
            $scope.operators = ['ALL', 'ANY', 'ONE'];
            $scope.conceptNameInvalid = false;
            $scope.orderTypes = orderTypeInitialization;

            $scope.addOrderSetMembers = function (event) {
                event.preventDefault();
                if (!$scope.orderSet.orderSetMembers) {
                    $scope.orderSet.orderSetMembers = [];
                }
                $scope.orderSet.orderSetMembers.push(buildOrderSetMember());
            };

            $scope.removeOrderSetMember = function (index) {
                if ($scope.orderSet.orderSetMembers[index].orderSetMemberId) {
                    $scope.orderSet.orderSetMembers[index].voided = true;
                } else {
                    $scope.orderSet.orderSetMembers.splice(index, 1);
                }
            };

            $scope.getConcepts = function (request) {
                return $http.get(Bahmni.Common.Constants.conceptUrl, {
                    params: {
                        q: request.term,
                        v: "custom:(uuid,name:(uuid,name),conceptClass:(uuid,name,display))"
                    }
                }).then(function (result) {
                    return result.data.results;
                });
            };

            $scope.getDataResults = function (selectedOrderType) {
                return function (results) {
                    var orderType = $scope.orderTypes.filter(function (orderObj) {
                        return orderObj.uuid === selectedOrderType.uuid;
                    })[0];
                    var orderTypeNames = _.pluck(orderType.conceptClasses, 'name');
                    return results.filter(function (concept) {
                        return _.contains(orderTypeNames, concept.conceptClass.name);
                    }).map(function (concept) {
                        return {'concept': {uuid: concept.uuid, name: concept.name.name}, 'value': concept.name.name}
                    });
                }
            };

            $scope.onSelect = function (index) {
                return function (selectedConcept) {
                    $scope.orderSet.orderSetMembers[index].concept = selectedConcept.concept;
                    $scope.orderSet.orderSetMembers[index].sequence = index + 1;
                };
            };

            $scope.toggleVoidOrderSetMember = function (orderSetMember) {
                orderSetMember.voided = !orderSetMember.voided;
            };

            $scope.clearConceptName = function (orderSetMember) {
                orderSetMember.concept = {};
            };

            var primaryAttributeCount = function () {
                var count = 0;
                _.each($scope.orderSet.orderSetMembers, function (orderSetMember) {
                    _.each(orderSetMember.orderSetMemberAttributes, function (orderSetMemberAttribute) {
                        if (orderSetMemberAttribute.value == "true") {
                            count++;
                        }
                    });
                });
                return count;
            };

            $scope.save = function () {
                if (validationSuccess()) {
                    spinner.forPromise(orderSetService.saveOrderSet(filterOrderSetAttributes($scope.orderSet)).then(function (response) {
                        $state.params.orderSetUuid = response.data.uuid;
                        return $state.transitionTo($state.current, $state.params, {
                            reload: true,
                            inherit: false,
                            notify: true
                        }).then(function () {
                            messagingService.showMessage('info', 'Saved');
                        });
                    }));
                }
            };

            var filterOrderSetAttributes = function (orderSet) {
                orderSet.orderSetMembers.forEach(function (orderSetMember) {
                    if (!_.isNull(orderSetMember.orderSetMemberAttributes)) {
                        orderSetMember.orderSetMemberAttributes = _.filter(orderSetMember.orderSetMemberAttributes, function (orderSetMemberAttribute) {
                            if(orderSetMemberAttribute.value) {
                                return true;
                            }
                        });
                    }
                });
                return orderSet;
            };

            var validationSuccess = function () {
                if (!$scope.orderSet.orderSetMembers || countActiveOrderSetMembers($scope.orderSet.orderSetMembers) < 2) {
                    messagingService.showMessage('error', 'Please enter a minimum of 2 order set to proceed with save.');
                    return false;
                }

                var primaryAttrCount = primaryAttributeCount();
                if (primaryAttrCount === 0) {
                    messagingService.showMessage('error', 'Please select atleast one member as Primary.');
                    return false;

                }
                return true;
            };

            var countActiveOrderSetMembers = function (orderSetMembers) {
                var countActive = 0;
                orderSetMembers.forEach(function (orderSetMember) {
                    if (!orderSetMember.voided) {
                        countActive++;
                    }
                });
                return countActive;
            };

            var map = function (orderSet) {
                var mappedOrderSet = {};
                if (orderSet.orderSetId) {
                    mappedOrderSet.orderSetId = orderSet.orderSetId;
                    mappedOrderSet.uuid = orderSet.uuid;
                }
                mappedOrderSet.name = orderSet.name;
                mappedOrderSet.description = orderSet.description;
                mappedOrderSet.operator = orderSet.operator;
                mappedOrderSet.orderSetMembers = [];
                mapOrderSet(orderSet, mappedOrderSet);
                return mappedOrderSet;
            };



            var filterOutOrderSet = function (orderSetResult) {
                orderSetResult.orderSetMembers = _.filter(orderSetResult.orderSetMembers, function (orderSetMemberObj) {
                    return !orderSetMemberObj.voided;
                });
                return orderSetResult;
            };

            var mapOrderSet = function (orderSet, mappedOrderSet) {
                if (orderSet.orderSetMembers) {
                    orderSet.orderSetMembers.forEach(function (orderSetMember) {
                        var orderSetMemberObj = {};
                        if (orderSetMember.orderSetMemberId) {
                            orderSetMemberObj.orderSetMemberId = orderSetMember.orderSetMemberId;
                            orderSetMemberObj.uuid = orderSetMember.uuid;
                        }
                        if (_.isEmpty(orderSetMember.orderSetMemberAttributes)) {
                            orderSetMember.orderSetMemberAttributes = [];
                            var primaryAttribute = {};
                            primaryAttribute.orderSetMemberAttributeType = $scope.primaryAttributeType;
                            orderSetMember.orderSetMemberAttributes.push(primaryAttribute);
                        }
                        orderSetMemberObj.orderSetMemberAttributes = orderSetMember.orderSetMemberAttributes;

                        orderSetMemberObj.orderType = {
                            uuid: orderSetMember.orderType.uuid
                        };
                        orderSetMemberObj.concept = {
                            name: orderSetMember.concept.name.display,
                            uuid: orderSetMember.concept.uuid
                        };
                        orderSetMemberObj.sequence = orderSetMember.sequence;
                        orderSetMemberObj.voided = orderSetMember.voided;
                        mappedOrderSet.orderSetMembers.push(orderSetMemberObj);
                    });
                }
            };

            var buildOrderSetMember = function () {
                var orderSetMemberAttributeTypeId = $scope.primaryAttributeType.orderSetMemberAttributeTypeId;
                var attribute = {
                    orderSetMemberAttributeType: {orderSetMemberAttributeTypeId: orderSetMemberAttributeTypeId},
                    value: ""
                };
                var orderSetMember = {
                    orderType: {uuid: $scope.orderTypes[0].uuid},
                    orderSetMemberAttributes: [attribute]
                };
                return orderSetMember;
            };

            var buildNewOrderSet = function () {
                $scope.orderSet = {
                    operator: $scope.operators[0],
                    orderSetMembers: [buildOrderSetMember(), buildOrderSetMember()] // Add 2 orderSet members by default
                };
            };

            var init = function () {
                spinner.forPromise(orderSetService.getOrderSetMemberAttributeType(Bahmni.Common.Constants.primaryOrderSetMemberAttributeTypeName).then(function (response) {
                    $scope.primaryAttributeType = response.data.results[0];
                    if ($state.params.orderSetUuid !== "new") {
                        spinner.forPromise(orderSetService.getOrderSet($state.params.orderSetUuid).then(function (response) {
                            $scope.orderSet = map(filterOutOrderSet(response.data));
                        }));
                    } else {
                        buildNewOrderSet();
                    }
                }));
            };

            init();
        }]);
