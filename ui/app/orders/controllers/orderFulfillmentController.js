"use strict";

var app = angular.module('bahmni.orders');
app.controller('OrderFulfillmentController', ['$scope', '$rootScope', '$stateParams', '$state', '$q', 'patientContext', 'orderService', 'orderTypeService', 'sessionService', 'encounterService', 'spinner', 'observationsService', 'conceptSetService', 'messagingService',
    function ($scope, $rootScope, $stateParams, $state, $q, patientContext, orderService, orderTypeService, sessionService, encounterService, spinner, observationsService, conceptSetService, messagingService) {

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
        return orderService.getOrders(patientUuid, orderTypeUuid).success(function(response) {
            $scope.orders = response.results;
        });
    };

    var getConcept = function() {
        var fields = ['uuid', 'name', 'names', 'set', 'hiNormal', 'lowNormal', 'hiAbsolute', 'lowAbsolute', 'units', 'conceptClass', 'datatype', 'handler', 'answers:(uuid,name,displayString,names)', 'descriptions'];
        var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', 1);
        return conceptSetService.getConceptSetMembers({name: $scope.formName, v: "custom:" + customRepresentation}).then(function(response) {
            $scope.conceptSet = response.data.results[0];
        })
    }

    var init = function() {
        return $q.all([getActiveEncounter(), getOrders(), getConcept()]);
    };

    spinner.forPromise(init());


    $scope.showOrderForm = function(order) {
        if(order.observations == null) {
            spinner.forPromise(observationsService.getObsForOrder(order.uuid).then(function(response) {
                order.observations = new Bahmni.Orders.OrderObservationsMapper().map(order, $scope.conceptSet, $scope.encounter, response.data);
                order.showForm = !order.showForm;
            }));
        } else {
            order.showForm = !order.showForm;
        }

    };

    $scope.save = function() {
        var observationFilter = new Bahmni.Common.Domain.ObservationFilter();
        var observations = []

        $scope.orders.forEach(function(order){
            if(order.observations) {
                order.observations.forEach(function(obs){
                    obs.orderUuid = order.uuid;
                });

                var orderObs = angular.copy(order.observations);
                observations.push.apply(observations, observationFilter.filter(orderObs));
            }
        });


        var encounterData = {
            locationUuid: sessionService.getLoginLocationUuid(),
            patientUuid: $scope.patient.uuid,
            observations: observations,
            testOrders: [],
            drugOrders: []
        };

        spinner.forPromise(encounterService.create(encounterData).then(function () {
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