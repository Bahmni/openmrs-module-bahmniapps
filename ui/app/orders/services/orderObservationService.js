'use strict';

angular.module('bahmni.orders')
    .factory('orderObservationService', ['encounterService', function (encounterService) {

        var save = function(orders, patient, locationUuid) {
            var observationFilter = new Bahmni.Common.Domain.ObservationFilter();
            var observations = []

            orders.forEach(function(order){
                if(order.observations) {
                    order.observations.forEach(function(obs){
                        obs.orderUuid = order.uuid;
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

        return {
            save: save
        };
    }]);
