'use strict';

angular.module('bahmni.common.domain')
    .factory('orderService', ['$q', 'offlineEncounterServiceStrategy',
        function ($q, offlineEncounterServiceStrategy) {
            var offlineEncounterService = offlineEncounterServiceStrategy;
            var getOrders = function (data) {
                var orders = [];
                var deferred = $q.defer();
                offlineEncounterService.getEncountersByPatientUuid(data.patientUuid).then(function (results) {
                    _.each(results, function (result) {
                        orders = orders.concat(result.encounter.orders);
                    });
                    deferred.resolve({"data": orders});
                });
                return deferred.promise;
            };
            return {
                getOrders: getOrders
            };
        }]);
