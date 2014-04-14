'use strict';

angular.module('bahmni.orders')
    .factory('PendingOrderService', ['$http', function ($http) {

    var getOrders = function (patientUuid, orderTypeUuid) {
        return $http.get("/openmrs/ws/rest/v1/order", {
            params:{
                patientUuid:patientUuid,
                orderTypeUuid:orderTypeUuid,
                s:'pendingOrders',
                v:'custom:(uuid,creator:(person,uuid),dateCreated,concept:(name,uuid),encounter:(uuid,provider,encounterType,visit:(uuid)))'},
            withCredentials:true
        });
    } ;

    var saveOrderResult = function(encounterTransaction){
        return $http.post(Bahmni.Common.Constants.emrEncounterUrl, encounterTransaction, {
            withCredentials:true
        });
    };

    return {
        getOrders:getOrders,
        saveOrderResult:saveOrderResult
    };
}]);
