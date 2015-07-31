'use strict';

angular.module('bahmni.common.orders')
    .factory('orderService', ['$http', function ($http) {

    var getOrders = function (params) {
        //params fields [patientUuid, orderTypeUuid, conceptNames, includeObs, numberOfVisits, obsIgnoreList, visitUuid, orderUuid]

            return $http.get(Bahmni.Common.Constants.bahmniOrderUrl, {
                params: params,
                withCredentials: true
            });
        };

        return {
            getOrders: getOrders
        };
    }]);
