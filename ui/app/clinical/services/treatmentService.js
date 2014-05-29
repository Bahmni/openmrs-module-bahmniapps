'use strict';

angular.module('bahmni.clinical')
    .factory('TreatmentService', ['$http', '$q', function ($http, $q) {

        var orderDateFromStringToDate = function (drugOrder) {
            drugOrder.orderDate = Bahmni.Common.Util.DateUtil.parse(drugOrder.orderDate);
            return drugOrder;
        };

        var getActiveDrugOrdersFromServer = function (patientUuid) {
            return $http.get(Bahmni.Common.Constants.bahmniOrderUrl,
                {
                    method: "GET",
                    params: { patientUuid: patientUuid  },
                    withCredentials: true
                }
            );
        };

        var getActiveDrugOrders = function (patientUuid) {
            var deferred = $q.defer();
            getActiveDrugOrdersFromServer(patientUuid).success(function (response) {
                var activeDrugOrders = response.map(orderDateFromStringToDate);
                deferred.resolve(activeDrugOrders);
            });
            return deferred.promise;
        };

        return {
            getActiveDrugOrders: getActiveDrugOrders
        };
    }]);