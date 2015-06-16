"use strict";

var app = angular.module('bahmni.orders');
app.controller('OrderFulfillmentController', ['$scope', '$rootScope', '$stateParams', '$state', '$q', 'patientContext', 'orderService', 'orderObservationService',
    'orderTypeService', 'sessionService', 'encounterService', 'spinner', 'messagingService', 'appService', '$anchorScroll', 'orderFulfillmentConfig',
    function ($scope, $rootScope, $stateParams, $state, $q, patientContext, orderService, orderObservationService,
              orderTypeService, sessionService, encounterService, spinner, messagingService, appService, $anchorScroll, orderFulfillmentConfig) {


    $scope.patient = patientContext.patient;
    $scope.formName = $stateParams.orderType + Bahmni.Common.Constants.fulfillmentFormSuffix;
    $scope.fulfillmentConfig = orderFulfillmentConfig;
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

    $scope.getOrders = function () {
        var patientUuid = patientContext.patient.uuid;
        $scope.orderTypeUuid = orderTypeService.getOrderTypeUuid($stateParams.orderType);
        var includeObs = false;
        return orderService.getOrders(patientUuid, $scope.orderTypeUuid, $scope.config.conceptNames, includeObs, $scope.config.numberOfVisits, $scope.config.obsIgnoreList, $scope.visitUuid, $scope.orderUuid).then(function (response) {
            var data = response.data;
            $scope.orders.push.apply($scope.orders, data);
            $scope.orders.forEach(function (order) {
                order.bahmniObservations = _.filter($scope.encounter.observations, function (observation) {
                    return observation.orderUuid === order.orderUuid;
                });
                if (order.bahmniObservations.length > 0) {
                    order.showForm = true;
                }
            });
        });
    };
    $scope.toggleShowOrderForm = function(order) {
        order.showForm = !order.showForm;
    };

    var init = function() {
        return getActiveEncounter().then($scope.getOrders);
    };

    spinner.forPromise(init());
    $scope.config = $scope.fulfillmentConfig || {};
    $anchorScroll();


    $scope.$on("event:saveOrderObservations", function() {
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