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

            if(data.obsIgnoreList) {
                params.obsIgnoreList = data.obsIgnoreList;
            }
            if(data.orderTypeUuid){
                params.orderTypeUuid = data.orderTypeUuid;
            }
            if(data.orderUuid){
                params.orderUuid = data.orderUuid;
            }
            if(data.visitUuid){
                params.visitUuid = data.visitUuid;
            }
            return $http.get(Bahmni.Common.Constants.bahmniOrderUrl, {
                params: params,
                withCredentials: true
            });
        };

        return {
            getOrders: getOrders
        };
    }]);
