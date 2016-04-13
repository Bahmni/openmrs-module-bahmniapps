'use strict';


angular.module('bahmni.common.domain')
    .controller('OrderSetController', ['$scope', '$state', 'spinner', '$http', '$q', 'orderSetService', 'messagingService', 'orderTypeService',
        function ($scope, $state, spinner, $http, $q, orderSetService, messagingService, orderTypeService) {
            $scope.operators = ['ALL', 'ANY', 'ONE'];
            $scope.conceptNameInvalid = false;

            $scope.addOrderSetMembers = function () {
                $scope.orderSet.orderSetMembers.push(buildOrderSetMember());
            };

            $scope.removeOrderSetMember = function (index) {
                if ($scope.orderSet.orderSetMembers[index].retired == false) {
                    if($scope.orderSet.orderSetMembers.length == 2) {
                        messagingService.showMessage('error', 'An orderSet should have a minimum of two orderSetMembers');
                        return;
                    }
                    $scope.orderSet.orderSetMembers[index].retired = true;
                    $scope.save();
                } else {
                    $scope.orderSet.orderSetMembers.splice(index, 1);
                }
            };

            $scope.moveOrderSetMemberUp = function (index) {
                if(index == 0) {
                    return;
                }
                var element = $scope.orderSet.orderSetMembers.splice(index, 1);
                $scope.orderSet.orderSetMembers.splice(index-1, 0, element[0]);
            };

            $scope.moveOrderSetMemberDown = function (index) {
                if(index == ($scope.orderSet.orderSetMembers.length-1)){
                    return;
                }
                var element = $scope.orderSet.orderSetMembers.splice(index, 1);
                $scope.orderSet.orderSetMembers.splice(index+1, 0, element[0]);
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
                    var orderTypeNames = _.map(orderType.conceptClasses, 'name');
                    return results.filter(function (concept) {
                        return _.includes(orderTypeNames, concept.conceptClass.name);
                    }).map(function (concept) {
                        return {'concept': {uuid: concept.uuid, name: concept.name.name}, 'value': concept.name.name}
                    });
                }
            };

            $scope.onSelect = function (orderSetMember) {
                return function (selectedConcept) {
                    orderSetMember.concept.display = selectedConcept.concept.display;
                    orderSetMember.concept.uuid = selectedConcept.concept.uuid;
                };
            };

            $scope.clearConceptName = function (orderSetMember, orderSet) {
                orderSetMember.concept = {};
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
