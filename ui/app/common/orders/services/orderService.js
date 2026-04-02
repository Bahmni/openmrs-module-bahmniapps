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
    .factory('orderService', ['$http', function ($http) {
        var getOrders = function (data) {
            var params = {
                concept: data.conceptNames,
                includeObs: data.includeObs,
                patientUuid: data.patientUuid,
                numberOfVisits: data.numberOfVisits
            };

            if (data.obsIgnoreList) {
                params.obsIgnoreList = data.obsIgnoreList;
            }
            if (data.orderTypeUuid) {
                params.orderTypeUuid = data.orderTypeUuid;
            }
            if (data.orderUuid) {
                params.orderUuid = data.orderUuid;
            }
            if (data.visitUuid) {
                params.visitUuid = data.visitUuid;
            }
            if (data.locationUuids && data.locationUuids.length > 0) {
                params.numberOfVisits = 0;
                params.locationUuids = data.locationUuids;
            }
            return $http.get(Bahmni.Common.Constants.bahmniOrderUrl, {
                params: params,
                withCredentials: true
            });
        };

        var getOrderByUuid = function (orderUuid, representation) {
            var url = Bahmni.Common.Constants.orderUrl.replace('{{orderUuid}}', orderUuid);
            return $http.get(url, {
                params: {v: representation},
                withCredentials: true
            });
        };

        return {
            getOrders: getOrders,
            getOrderByUuid: getOrderByUuid
        };
    }]);
