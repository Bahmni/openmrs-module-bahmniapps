'use strict';

angular.module('orders.pending.services')
    .factory('PendingOrderService', ['$http', function ($http) {

    var getOrders = function (patientUuid, orderTypeUuid) {
        return $http.get("/openmrs/ws/rest/v1/order", {
            params:{patientUuid:patientUuid, orderTypeUuid:orderTypeUuid,s:'pendingOrders',v:'full'},
            withCredentials:true
        });
    } ;

    var saveOrderResult = function(encounterTransaction){
        return $http.post(Bahmni.Common.Constants.encounterUrl, encounterTransaction, {
            withCredentials:true
        });
    };

    return {
        getOrders:getOrders,
        saveOrderResult:saveOrderResult
    };
}]);
