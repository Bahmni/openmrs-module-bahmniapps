'use strict';

angular.module('bahmni.clinical')
    .factory('TreatmentService', ['$http', '$q', function ($http, $q) {

        var createDrugOrder = function (drugOrder) {
            return Bahmni.Clinical.DrugOrder.create(drugOrder);
        };

        var createDrugOrderViewModel = function (drugOrder, drugOrderAppConfig) {
            return Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, drugOrderAppConfig, undefined);
        };

        var getActiveDrugOrdersFromServer = function (patientUuid) {
            return $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/active", {
                params: { patientUuid: patientUuid  },
                withCredentials: true
            });
        };

        var getPrescribedAndActiveDrugOrders = function (patientUuid, numberOfVisits, getOtherActive, visitUuids, startDate, endDate, getEffectiveOrdersOnly, drugOrderAppConfig) {
            return $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/prescribedAndActive", {
                params: {
                    patientUuid: patientUuid,
                    numberOfVisits: numberOfVisits,
                    getOtherActive: getOtherActive,
                    visitUuids: visitUuids,
                    startDate: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(startDate),
                    endDate: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(endDate),
                    getEffectiveOrdersOnly: getEffectiveOrdersOnly
                },
                withCredentials: true
            }).success(function (response) {
                for (var key in response) {
                    response[key] = response[key].map(createDrugOrder);
                    response[key] = response[key].map(function(drugOrder){
                        return createDrugOrderViewModel(drugOrder, drugOrderAppConfig);
                    });
                }
            });
        };

        var getConfig = function () {
            return $http.get(Bahmni.Common.Constants.drugOrderConfigurationUrl, {
                withCredentials: true
            });
        };

        var getActiveDrugOrders = function (patientUuid) {
            var deferred = $q.defer();
            getActiveDrugOrdersFromServer(patientUuid).success(function (response) {
                var activeDrugOrders = response.map(createDrugOrder);
                deferred.resolve(activeDrugOrders);
            });
            return deferred.promise;
        };

        var getPrescribedDrugOrders = function(patientUuid, includeActiveVisit, numberOfVisits) {
            var deferred = $q.defer();
            $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl, {
                method: "GET",
                params: {
                    patientUuid: patientUuid,
                    numberOfVisits: numberOfVisits,
                    includeActiveVisit: includeActiveVisit
                },
                withCredentials: true
            }).success(function (response) {
                var activeDrugOrders = response.map(createDrugOrder);
                deferred.resolve(activeDrugOrders);
            });
            return deferred.promise;
        };

        var getNonCodedDrugConcept = function () {
            var deferred = $q.defer();
            $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                method: "GET",
                params: {
                    property: 'drugOrder.drugOther'
                },
                withCredentials: true,
                headers: {
                    Accept: 'text/plain'
                }
            }).success(function (conceptUuid) {
                deferred.resolve(conceptUuid);
            });
            return deferred.promise;
        };

        var getAllDrugOrdersFor = function (patientUuid, conceptSetToBeIncluded, conceptSetToBeExcluded, isActive, drugOrderAppConfig) {
            var deferred = $q.defer();
            var params= {patientUuid: patientUuid};
            if(conceptSetToBeIncluded){
                params.includeConceptSet = conceptSetToBeIncluded;
            }
            if(conceptSetToBeExcluded){
                params.excludeConceptSet = conceptSetToBeExcluded;
            }
            if(isActive != undefined){
                params.isActive=isActive;
            }

            $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/drugOrderDetails", {
                params: params,
                withCredentials: true
            }).success(function (response) {
                var allDrugOrders = response.map(function(drugOrder){
                    return createDrugOrderViewModel(drugOrder, drugOrderAppConfig);
                });
                deferred.resolve(allDrugOrders);
            });
            return deferred.promise;
        };
        return {
            getActiveDrugOrders: getActiveDrugOrders,
            getConfig: getConfig,
            getPrescribedDrugOrders: getPrescribedDrugOrders,
            getPrescribedAndActiveDrugOrders: getPrescribedAndActiveDrugOrders,
            getNonCodedDrugConcept: getNonCodedDrugConcept,
            getAllDrugOrdersFor: getAllDrugOrdersFor
        };
    }]);
