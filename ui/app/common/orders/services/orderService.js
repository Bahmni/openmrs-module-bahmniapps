'use strict';

angular.module('bahmni.common.orders')
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
    var getOrderWithObservations = function (patientUuid, orderTypeUuid, numberOfVisits, conceptNames, obsIgnoreList, visitUuid, orderUuid) {
            var params = {concept: conceptNames};
            if(obsIgnoreList) {
                params.obsIgnoreList = obsIgnoreList;
            }
            if(orderTypeUuid){
                params.orderTypeUuid = orderTypeUuid;
            }
            if(orderUuid){
                params.orderUuid = orderUuid;
            }
            if(visitUuid){
                params.visitUuid = visitUuid;
            }
            else{
                params.patientUuid = patientUuid;
                params.numberOfVisits = numberOfVisits;
            }
            return $http.get(Bahmni.Common.Constants.orderObservationsUrl, {
                params: params,
                withCredentials: true
            });
        };

        return {
            getOrders: getOrders,
            getOrderWithObservations: getOrderWithObservations
        };
    }]);
