'use strict';

angular.module('bahmni.common.orders')
    .factory('orderObservationService', ['encounterService', function (encounterService) {

        var save = function(orders, patient, locationUuid) {
            var observationFilter = new Bahmni.Common.Domain.ObservationFilter();
            var observations = []

            orders.forEach(function(order){
                if(order.observations) {
                    order.observations.forEach(function(obs){
                        addOrderUuidToObservation(obs, order.uuid);
                    });

                    var orderObs = angular.copy(order.observations);
                    observations.push.apply(observations, observationFilter.filter(orderObs));
                }
            });


            var encounterData = {
                locationUuid: locationUuid,
                patientUuid: patient.uuid,
                observations: observations,
                testOrders: [],
                drugOrders: []
            };

            return encounterService.create(encounterData);
        };

        var addOrderUuidToObservation = function(observation, orderUuid){
            observation.orderUuid = orderUuid;
            if(observation.groupMembers && observation.groupMembers.length > 0){
                observation.groupMembers.forEach(function(member){
                    addOrderUuidToObservation(member, orderUuid)
                });
            }
        };
        return {
            save: save,
            addOrderUuidToObservation: addOrderUuidToObservation
        };
    }]);
