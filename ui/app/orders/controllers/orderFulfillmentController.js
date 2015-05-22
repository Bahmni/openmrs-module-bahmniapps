"use strict";

var app = angular.module('bahmni.orders');
app.controller('OrderFulfillmentController', ['$scope', '$rootScope', '$stateParams', '$state', '$q', 'patientContext', 'orderService', 'orderObservationService', 'orderTypeService', 'sessionService', 'encounterService', 'spinner', 'messagingService',
    function ($scope, $rootScope, $stateParams, $state, $q, patientContext, orderService, orderObservationService, orderTypeService, sessionService, encounterService, spinner, messagingService) {

    $scope.patient = patientContext.patient;
    $scope.formName = $stateParams.orderType + " Fulfillment Form";

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

    var getOrders = function() {
        var patientUuid = patientContext.patient.uuid;
        var orderTypeUuid = orderTypeService.getOrderTypeUuid($stateParams.orderType);
        return orderService.getOrders(patientUuid, orderTypeUuid).then(function(response) {
            $scope.orders = response.data.results;
        });
    };

    var init = function() {
        return $q.all([getActiveEncounter(), getOrders()]);
    };

    spinner.forPromise(init());

    $scope.showOrderForm = function(order) {
        if(order.observations == null) {
            order.observations = _.filter($scope.encounter.observations, function (observation) {
                return observation.orderUuid === order.uuid;
            });
        }
        order.showForm = !order.showForm;
    };

    $scope.save = function() {
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
    };
}]);