'use strict';

angular.module('bahmni.orders')
    .factory('orderService', ['$http', function ($http) {

    var getOrders = function (patientUuid, orderTypeUuid, scope) {
        return $http.get(Bahmni.Common.Constants.orderUrl, {
            params:{
                patientUuid: patientUuid,
                orderTypeUuid: orderTypeUuid,
                s: scope,
                v: 'custom:(uuid,creator:(person,uuid),dateCreated,concept:(name,uuid),encounter:(uuid,provider,encounterType,visit:(uuid)))'},
            withCredentials:true
        });
    };

    var getPendingOrders = function(patientUuid, orderTypeUuid){
        return getOrders(patientUuid,orderTypeUuid, 'pendingOrders');
    }

    var saveOrderResult = function(encounterTransaction){
        return $http.post(Bahmni.Common.Constants.emrEncounterUrl, encounterTransaction, {
            withCredentials:true
        });
    };

    return {
        getOrders:getOrders,
        getPendingOrders: getPendingOrders,
        saveOrderResult:saveOrderResult
    };
}]);
