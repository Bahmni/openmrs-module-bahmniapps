'use strict';

angular.module('bahmni.common.orders')
    .factory('orderService', ['$http', function ($http) {

    var getOrders = function (patientUuid, orderTypeUuid, conceptNames, includeObs, numberOfVisits, obsIgnoreList, visitUuid, orderUuid, scope) {
            var params = {
                concept: conceptNames,
                includeObs: includeObs
            };
            
            if(obsIgnoreList) {
                params.obsIgnoreList = obsIgnoreList;
            }
            if(orderTypeUuid){
                params.orderTypeUuid = orderTypeUuid;
                params.scope = scope;
            }
            if(orderUuid){
                params.orderUuid = orderUuid;
                params.scope = scope;
            }
            if(visitUuid){
                params.visitUuid = visitUuid;
                params.scope = scope;
            }
            else{
                params.patientUuid = patientUuid;
                params.numberOfVisits = numberOfVisits;
                params.scope = scope;
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
