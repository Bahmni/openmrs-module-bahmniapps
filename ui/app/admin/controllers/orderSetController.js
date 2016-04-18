'use strict';

var mapResponse = function (concept) {
    return {
        concept: {uuid: concept.uuid, name: concept.name.name},
        value: concept.name.name
    };
};
var updateOrderSetMemberConcept = function (newOrderSetMember, oldOrderSetMember) {
    oldOrderSetMember.concept.display = newOrderSetMember.concept.display;
    oldOrderSetMember.concept.uuid = newOrderSetMember.concept.uuid;
};
var moveUp = function (array, element) {
    var index = _.indexOf(array, element);
    var firstIndex = 0;
    if (index === firstIndex) {
        return false;
    }
    array.splice(index, 1);
    array.splice(index - 1, 0, element);
    return true;
};
var moveDown = function (array, element) {
    var index = _.indexOf(array, element);
    var lastIndex = array.length - 1;
    if (index === lastIndex) {
        return false;
    }
    array.splice(index, 1);
    array.splice(index + 1, 0, element);
    return true;
};

angular.module('bahmni.common.domain')
    .controller('OrderSetController', ['$scope', '$state', 'spinner', '$http', '$q', 'orderSetService', 'messagingService', 'orderTypeService',
        function ($scope, $state, spinner, $http, $q, orderSetService, messagingService, orderTypeService) {
            $scope.operators = ['ALL', 'ANY', 'ONE'];
            $scope.conceptNameInvalid = false;

            $scope.addOrderSetMembers = function () {
                $scope.orderSet.orderSetMembers.push(buildOrderSetMember());
            };

            $scope.remove = function (orderSetMember) {
                if (orderSetMember.retired == false) {
                    if ($scope.orderSet.orderSetMembers.length == 2) {
                        messagingService.showMessage('error', 'An orderSet should have a minimum of two orderSetMembers');
                        return;
                    }
                    orderSetMember.retired = true;
                    $scope.save();
                } else {
                    _.remove($scope.orderSet.orderSetMembers, orderSetMember);
                }
            };

            $scope.moveUp = function (orderSetMember) {
                return moveUp($scope.orderSet.orderSetMembers, orderSetMember);
            };

            $scope.moveDown = function (orderSetMember) {
                return moveDown($scope.orderSet.orderSetMembers, orderSetMember);
            };

            var getConcepts = function (request, isOrderTypeMatching) {
                return $http.get(Bahmni.Common.Constants.conceptUrl, {
                    params: {
                        q: request.term,
                        v: "custom:(uuid,name:(uuid,name),conceptClass:(uuid,name,display))"
                    }
                }).then(function (response) {
                    var results = _.get(response, 'data.results');
                    var resultsMatched = _.filter(results, isOrderTypeMatching);
                    return _.map(resultsMatched, mapResponse);
                });
            };

            $scope.getConcepts = function (orderSetMember) {
                var selectedOrderType = orderSetMember.orderType;
                var orderType = _.find($scope.orderTypes, {uuid: selectedOrderType.uuid});
                var orderTypeNames = _.map(orderType.conceptClasses, 'name');
                var isOrderTypeMatching = function (concept) {
                    return _.includes(orderTypeNames, concept.conceptClass.name);
                };
                return _.partial(getConcepts, _, isOrderTypeMatching);
            };

            (function(){
                var newOrderSetMember;
                $scope.onSelect = function (oldOrderSetMember) {
                    newOrderSetMember = oldOrderSetMember;
                };

                $scope.onChange = function (oldOrderSetMember) {
                    if(newOrderSetMember){
                        updateOrderSetMemberConcept(newOrderSetMember,oldOrderSetMember);
                        newOrderSetMember = null;
                        return;
                    }
                    oldOrderSetMember.orderTemplate = {};
                    delete oldOrderSetMember.concept.uuid;
                };
            })();

            $scope.clearConceptName = function (orderSetMember) {
                orderSetMember.concept = {};
                orderSetMember.orderTemplate = {};
            };

            $scope.save = function () {
                if (validationSuccess()) {
                    spinner.forPromise(orderSetService.createOrUpdateOrderSet($scope.orderSet).then(function (response) {
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

            var validationSuccess = function () {
                if (!$scope.orderSet.orderSetMembers || $scope.orderSet.orderSetMembers.length < 2) {
                    messagingService.showMessage('error', 'An orderSet should have a minimum of two orderSetMembers');
                    return false;
                }

                return true;
            };

            var buildOrderSetMember = function () {
                return {
                    orderType: {uuid: $scope.orderTypes[0].uuid}
                };
            };

            var init = function () {
                var init = $q.all([
                    orderTypeService.loadAll(),
                    orderSetService.getDrugConfig()
                ]).then(function (results) {
                    $scope.orderTypes = results[0];
                    $scope.treatmentConfig = results[1];
                    if ($state.params.orderSetUuid !== "new") {
                        spinner.forPromise(orderSetService.getOrderSet($state.params.orderSetUuid).then(function (response) {
                            $scope.orderSet = Bahmni.Common.OrderSet.create(response.data);
                        }));
                    }
                    else {
                        $scope.orderSet = Bahmni.Common.OrderSet.create();
                        $scope.orderSet.operator = $scope.operators[0];
                        $scope.orderSet.orderSetMembers.push(
                            Bahmni.Common.OrderSet.createOrderSetMember(buildOrderSetMember()),
                            Bahmni.Common.OrderSet.createOrderSetMember(buildOrderSetMember())
                        );
                    }
                });
                spinner.forPromise(init);
            };
            init();
        }]);
