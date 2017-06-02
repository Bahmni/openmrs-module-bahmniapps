'use strict';

angular.module('bahmni.common.orders')
    .service('orderSetService', ['$http', '$q', function ($http, $q) {
        this.getOrderSetsByQuery = function (name) {
            return $http.get(Bahmni.Common.Constants.orderSetUrl, {
                params: {
                    v: "full",
                    s: "byQuery",
                    q: name
                }
            });
        };

        this.getCalculatedDose = function (patientUuid, drugName, baseDose, doseUnit, orderSetName, dosingRule, visitUuid) {
            if (typeof dosingRule !== 'undefined' && dosingRule != '' && dosingRule != null) {
                var requestString = JSON.stringify({
                    patientUuid: patientUuid,
                    drugName: drugName,
                    baseDose: baseDose,
                    doseUnit: doseUnit,
                    orderSetName: orderSetName,
                    dosingRule: dosingRule,
                    visitUuid: visitUuid
                });
                return $http.get(Bahmni.Common.Constants.calculateDose, {
                    params: {
                        dosageRequest: requestString },
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                }).then(function (response) {
                    return {
                        dose: round(response.data.value),
                        doseUnit: response.data.doseUnit
                    };
                });
            }
            var deferred = $q.defer();
            deferred.resolve({
                dose: baseDose,
                doseUnit: doseUnit
            });
            return deferred.promise;
        };
        var round = function (value) {
            var leastRoundableDose = 0.49;
            var leastPrescribableDose = 0.1;
            value = value <= leastRoundableDose ? value : _.round(value);
            return (value < leastPrescribableDose) ? leastPrescribableDose : value;
        };
    }]);
