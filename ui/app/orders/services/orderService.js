'use strict';

angular.module('bahmni.orders')
    .factory('orderService', ['$http', function ($http) {

    var getOrders = function (patientUuid, orderTypeUuid, scope, offset, limit) {
        offset = offset || 0;
        scope = scope || "byOrderType";
        return $http.get(Bahmni.Common.Constants.orderUrl, {
            params:{
                patientUuid: patientUuid,
                orderTypeUuid: orderTypeUuid,
                startIndex: offset,
                limit: limit,
                s: scope,
                v: 'custom:(uuid,creator:(person,uuid),dateCreated,concept:(name,uuid),encounter:(uuid,provider,encounterType,visit:(uuid)))'},
            withCredentials:true
        });
    };

    return {
        getOrders:getOrders
    };
}]);
