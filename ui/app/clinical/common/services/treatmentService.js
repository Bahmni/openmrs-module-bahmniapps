'use strict';

angular.module('bahmni.clinical')
    .factory('treatmentService', ['$http', '$q', 'appService', function ($http, $q, appService) {
        var createDrugOrder = function (drugOrder) {
            return Bahmni.Clinical.DrugOrder.create(drugOrder);
        };
        var getActiveDrugOrdersFromServer = function (patientUuid, startDate, endDate) {
            return $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/active", {
                params: {
                    patientUuid: patientUuid,
                    startDate: startDate,
                    endDate: endDate
                },
                withCredentials: true
            });
        };

        var getPrescribedAndActiveDrugOrders = function (patientUuid, numberOfVisits, getOtherActive, visitUuids, startDate, endDate, getEffectiveOrdersOnly) {
            return $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/prescribedAndActive", {
                params: {
                    patientUuid: patientUuid,
                    numberOfVisits: numberOfVisits,
                    getOtherActive: getOtherActive,
                    visitUuids: visitUuids,
                    startDate: startDate,
                    endDate: endDate,
                    getEffectiveOrdersOnly: getEffectiveOrdersOnly
                },
                withCredentials: true
            }).success(function (response) {
                for (var key in response) {
                    response[key] = response[key].map(createDrugOrder);
                }
            });
        };

        var getConfig = function () {
            return $http.get(Bahmni.Common.Constants.drugOrderConfigurationUrl, {
                withCredentials: true
            });
        };

        var getProgramConfig = function () {
            var programConfig = appService.getAppDescriptor() ? appService.getAppDescriptor().getConfigValue("program") || {} : {};
            return programConfig;
        };

        var getActiveDrugOrders = function (patientUuid, fromDate, toDate) {
            var programConfig = getProgramConfig();
            var startDate = programConfig.showDetailsWithinDateRange ? fromDate : null;
            var endDate = programConfig.showDetailsWithinDateRange ? toDate : null;

            var deferred = $q.defer();
            getActiveDrugOrdersFromServer(patientUuid, startDate, endDate).success(function (response) {
                var activeDrugOrders = response.map(createDrugOrder);
                deferred.resolve(activeDrugOrders);
            });
            return deferred.promise;
        };

        var getPrescribedDrugOrders = function (patientUuid, includeActiveVisit, numberOfVisits, fromDate, toDate) {
            var programConfig = getProgramConfig();
            var startDate = programConfig.showDetailsWithinDateRange ? fromDate : null;
            var endDate = programConfig.showDetailsWithinDateRange ? toDate : null;

            var deferred = $q.defer();
            $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl, {
                method: "GET",
                params: {
                    patientUuid: patientUuid,
                    numberOfVisits: numberOfVisits,
                    includeActiveVisit: includeActiveVisit,
                    startDate: startDate,
                    endDate: endDate
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

        var getAllDrugOrdersFor = function (patientUuid, conceptSetToBeIncluded, conceptSetToBeExcluded, isActive, patientProgramUuid) {
            var deferred = $q.defer();
            var params = {patientUuid: patientUuid};
            if (conceptSetToBeIncluded) {
                params.includeConceptSet = conceptSetToBeIncluded;
            }
            if (conceptSetToBeExcluded) {
                params.excludeConceptSet = conceptSetToBeExcluded;
            }
            if (isActive !== undefined) {
                params.isActive = isActive;
            }
            if (patientProgramUuid) {
                params.patientProgramUuid = patientProgramUuid;
            }

            $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/drugOrderDetails", {
                params: params,
                withCredentials: true
            }).success(function (response) {
                deferred.resolve(response);
            });
            return deferred.promise;
        };

        var voidDrugOrder = function (drugOrder) {
            var deferred = $q.defer();

            $http.delete([Bahmni.Common.Constants.ordersUrl, '/', drugOrder.uuid].join('')).success(function (response) {
                deferred.resolve(response);
            });

            return deferred.promise;
        };

        return {
            getActiveDrugOrders: getActiveDrugOrders,
            getConfig: getConfig,
            getPrescribedDrugOrders: getPrescribedDrugOrders,
            getPrescribedAndActiveDrugOrders: getPrescribedAndActiveDrugOrders,
            getNonCodedDrugConcept: getNonCodedDrugConcept,
            getAllDrugOrdersFor: getAllDrugOrdersFor,
            voidDrugOrder: voidDrugOrder
        };
    }]);
