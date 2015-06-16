'use strict';

angular.module('bahmni.common.orders')
    .factory('orderService', ['$http', function ($http) {

    var getOrders = function (patientUuid, orderTypeUuid, conceptNames, includeObs, numberOfVisits, obsIgnoreList, visitUuid, orderUuid) {

            var params = {
                concept: conceptNames,
                includeObs: includeObs,
                patientUuid: patientUuid,
                numberOfVisits: numberOfVisits
            };
            
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

            return $http.get(Bahmni.Common.Constants.bahmniOrderUrl, {
                params: params,
                withCredentials: true
            });
        };

        return {
            getOrders: getOrders
        };
    }]);
