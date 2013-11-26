'use strict';

angular.module('orders.pending.services')
    .factory('PendingOrderService', ['$http', function ($http) {

    var getOrders = function (patientUuid, orderTypeUuid) {
        return $http.get("/openmrs/ws/rest/v1/order", {
            method:"GET",
            params:{patientUuid:patientUuid, orderTypeUuid:orderTypeUuid,s:'pendingOrders',v:'full'},
            withCredentials:true
        });
    }

    return {
        getOrders:getOrders,
    };
}]);
