"use strict";

var app = angular.module('bahmni.orders');
app.controller('OrderFulfillmentController', ['$scope', '$rootScope', '$stateParams', '$state', '$q', 'patientContext', 'orderService', 'orderObservationService', 'orderTypeService', 'sessionService', 'encounterService', 'spinner', 'messagingService',
    function ($scope, $rootScope, $stateParams, $state, $q, patientContext, orderService, orderObservationService, orderTypeService, sessionService, encounterService, spinner, messagingService) {

    var limit = 10;
    $scope.patient = patientContext.patient;
    $scope.formName = $stateParams.orderType + " Fulfillment Form";
    $scope.orderType = $stateParams.orderType;
    $scope.nextPageLoading = false;
    $scope.orders = [];

    var getActiveEncounter = function () {
        var currentProviderUuid = $rootScope.currentProvider ? $rootScope.currentProvider.uuid : null;
        return encounterService.activeEncounter({
            patientUuid: $scope.patient.uuid,
            providerUuid: currentProviderUuid,
            includeAll: Bahmni.Common.Constants.includeAllObservations,
            locationUuid: sessionService.getLoginLocationUuid()
        }).then(function (encounterTransactionResponse) {
            return $scope.encounter = encounterTransactionResponse.data;
        });
    };

    var getOrders = function(offset) {
        var patientUuid = patientContext.patient.uuid;
        var orderTypeUuid = orderTypeService.getOrderTypeUuid($stateParams.orderType);
        return orderService.getOrders(patientUuid, orderTypeUuid, null, offset, limit);
    };

    $scope.nextOrders = function () {
        if ($scope.nextPageLoading) {
            return;
        }
        $scope.nextPageLoading = true;
        var promise = getOrders($scope.orders.length);
        promise.then(function (response) {
            var data = response.data;
            $scope.orders.push.apply($scope.orders, data.results);
            $scope.noMoreResultsPresent = (data.results.length === 0);
            $scope.nextPageLoading = false;
        }, function() {
            $scope.nextPageLoading = false;
        });
        return promise;
    };

    var init = function() {
        return $q.all([getActiveEncounter(), $scope.nextOrders()]).then(function(){
            $scope.orders.forEach(function (order) {
                order.observations = _.filter($scope.encounter.observations, function (observation) {
                    return observation.orderUuid === order.uuid;
                });
                if (order.observations.length > 0) {
                    $scope.showOrderForm(order);
                }
            })
        });
    };

    spinner.forPromise(init());

    $scope.showOrderForm = function(order) {
        order.showForm = !order.showForm;
    };

    $rootScope.$on("event:saveOrderObservations", function() {
        var savePromise = orderObservationService.save($scope.orders, $scope.patient, sessionService.getLoginLocationUuid());
        spinner.forPromise(savePromise.then(function () {
            $state.transitionTo($state.current, $state.params, {
                reload: true,
                inherit: false,
                notify: true
            }).then(function () {
                messagingService.showMessage('info', 'Saved');
            });
        }).catch(function (error) {
            var message = 'An error has occurred on the server. Information not saved.';
            messagingService.showMessage('formError', message);
        }));
    });

}]);