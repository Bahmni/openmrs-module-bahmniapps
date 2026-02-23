/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.orders')
    .factory('orderObservationService', ['encounterService', function (encounterService) {
        var save = function (orders, patient, locationUuid) {
            var observationFilter = new Bahmni.Common.Domain.ObservationFilter();
            var observations = [];

            orders.forEach(function (order) {
                if (order.bahmniObservations) {
                    order.bahmniObservations.forEach(function (obs) {
                        addOrderUuidToObservation(obs, order.orderUuid);
                    });

                    var orderObs = angular.copy(order.bahmniObservations);
                    observations.push.apply(observations, observationFilter.filter(orderObs));
                }
            });

            var encounterData = {
                locationUuid: locationUuid,
                patientUuid: patient.uuid,
                observations: observations,
                orders: [],
                drugOrders: []
            };

            return encounterService.create(encounterData);
        };

        var addOrderUuidToObservation = function (observation, orderUuid) {
            observation.orderUuid = orderUuid;
            if (observation.groupMembers && observation.groupMembers.length > 0) {
                observation.groupMembers.forEach(function (member) {
                    addOrderUuidToObservation(member, orderUuid);
                });
            }
        };
        return {
            save: save,
            addOrderUuidToObservation: addOrderUuidToObservation
        };
    }]);
