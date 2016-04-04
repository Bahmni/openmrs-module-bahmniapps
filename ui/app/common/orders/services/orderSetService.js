'use strict';

angular.module('bahmni.common.orders')
    .service('orderSetService', ['$http', '$q', function ($http, $q) {
        this.getAllOrderSets = function () {
            return $http.get(Bahmni.Common.Constants.orderSetUrl, {
                params: {v: "full"}
            });
        };

        this.getOrderSet = function (uuid) {
            return $http.get(Bahmni.Common.Constants.orderSetUrl + "/" + uuid, {
                params: {v: "full"}
            });
        };

        this.getOrderSetMemberAttributeType = function (name) {
            return $http.get(Bahmni.Common.Constants.orderSetMemberAttributeTypeUrl, {
                params: {name: name}
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

        this.getOrderSetWithAttributeNameAndValue = function (conceptUuid, attributeName, attributeValue) {
            var url = Bahmni.Common.Constants.orderSetUrl;
            return $http.get(url, {
                params: {
                    drugConceptUuid: conceptUuid,
                    attributeType: attributeName,
                    attributeValue: attributeValue,
                    v: "custom:(name,uuid,orderSetMembers)"
                },
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };


        this.getUniqueOrderSetMembersWithoutPrimaryConcept = function (conceptUuid, attributeName, attributeValue) {
            return this.getOrderSetWithAttributeNameAndValue(conceptUuid, attributeName, attributeValue).then(function (data) {
                return filterOrderSetMembers(conceptUuid, data.data.results);
            })
        };

        var filterOrderSetMembers = function (primaryConceptUuid, orderSets) {
            var orderSetMembers = {};
            _.forEach(orderSets, function (orderSet) {
                _.forEach(orderSet.orderSetMembers, function (orderSetMember) {
                    if (primaryConceptUuid !== orderSetMember.concept.uuid) {
                        orderSetMembers[orderSetMember.concept.uuid] = orderSetMember;
                    }
                })
            });
            return _.values(orderSetMembers);
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
                        dose: response.data.value,
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
