'use strict';

angular.module('bahmni.common.orders')
    .service('orderSetService', ['$http', '$q', function ($http, $q) {
        this.getAllOrderSets = function () {
            return $http.get(Bahmni.Common.Constants.orderSetUrl, {
                params: {v: "full"}
            });
        };

        this.getOrderSetsByQuery = function (name) {
            return $http.get(Bahmni.Common.Constants.orderSetUrl, {
                params: {
                    v: "full",
                    s: "byQuery",
                    q: name
                }
            });
        };

        this.getOrderSet = function (uuid) {
            return $http.get(Bahmni.Common.Constants.orderSetUrl + "/" + uuid, {
                params: {v: "full"}
            });
        };

        this.createOrUpdateOrderSet = function (orderSet) {
            var url;
            _.each(orderSet.orderSetMembers, function (orderSetMember) {
                if (orderSetMember.orderTemplate) {
                    orderSetMember.orderTemplate = JSON.stringify(orderSetMember.orderTemplate);
                }
            });
            if(orderSet.uuid) {
                url = Bahmni.Common.Constants.orderSetUrl + "/" + orderSet.uuid;
            } else {
                url = Bahmni.Common.Constants.orderSetUrl;
            }
            return $http.post(url, orderSet, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        this.removeOrderSet = function(orderSet) {
            var req = {
                url: Bahmni.Common.Constants.orderSetUrl + "/" + orderSet.uuid,
                content: {
                    "!purge": "",
                    "reason": "User deleted the orderSet."
                },
                headers: {"Content-Type": "application/json"}
            };
            return $http.delete(req.url, req.content, req.headers);
        };

        this.getDrugConfig = function () {
            return $http.get(Bahmni.Common.Constants.drugOrderConfigurationUrl, {
                withCredentials: true
            }).then(function (result) {
                var config = result.data;
                config.durationUnits = [
                    {name: "Day(s)", factor: 1},
                    {name: "Week(s)", factor: 7},
                    {name: "Month(s)", factor: 30}
                ];
                _.each(Bahmni.Common.Constants.orderSetSpecialUnits, function (doseUnit) {
                    config.doseUnits.push({name: doseUnit});
                });
                return config;
            });
        };

        var hasSpecialDoseUnit = function (doseUnits) {
            return _.includes(Bahmni.Common.Constants.orderSetSpecialUnits, doseUnits);
        };

        this.getCalculatedDose = function (patientUuid, baseDose, doseUnit) {
            if (hasSpecialDoseUnit(doseUnit)) {
                return $http.get(Bahmni.Common.Constants.calculateDose, {
                    params: {
                        patientUuid: patientUuid,
                        baseDose: baseDose,
                        doseUnit: doseUnit
                    },
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                }).then(function (response) {
                    return {
                        dose: _.round(response.data.value),
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
    }]);
