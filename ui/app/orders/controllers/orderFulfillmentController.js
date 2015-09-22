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
        return encounterService.find({
            patientUuid: $scope.patient.uuid,
            providerUuids: !_.isEmpty(currentProviderUuid) ? [currentProviderUuid] : null,
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
        var params = {
            patientUuid:patientUuid,
            orderTypeUuid:$scope.orderTypeUuid,
            conceptNames:$scope.config.conceptNames,
            includeObs:includeObs,
            numberOfVisits:$scope.config.numberOfVisits,
            obsIgnoreList:$scope.config.obsIgnoreList,
            visitUuid:$scope.visitUuid,
            orderUuid:$scope.orderUuid
        };
        return orderService.getOrders(params).then(function (response) {
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
            try {
                /*This is a dirty fix to do, the real reason of failure is because of there is no visit type assosiated with
                 save request to create a new visit in mrs.
                  */
                if(error.data.error.message.indexOf("Visit Type is required") >= 0){
                    message = "Visit already closed, create new visit to fulfill the order";
                }
            } catch(e) { /* ignore the error */}
            messagingService.showMessage('formError', message);
        }));
    });

}]);