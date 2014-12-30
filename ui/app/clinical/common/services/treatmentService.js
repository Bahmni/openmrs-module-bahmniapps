'use strict';

angular.module('bahmni.clinical')
    .factory('TreatmentService', ['$http', '$q', function ($http, $q) {

        var createDrugOrder = function (drugOrder) {
            return Bahmni.Clinical.DrugOrder.create(drugOrder);
        };

        var getActiveDrugOrdersFromServer = function (patientUuid) {
            return $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/active", {
                params: { patientUuid: patientUuid  },
                withCredentials: true
            });
        };

        var getConfig = function () {
            return $http.get(Bahmni.Common.Constants.bahmniDrugOrderUrl + "/config", {
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
                params: { patientUuid: patientUuid, numberOfVisits: numberOfVisits, includeActiveVisit: includeActiveVisit},
                withCredentials: true
            }).success(function (response) {
                var activeDrugOrders = response.map(createDrugOrder);
                deferred.resolve(activeDrugOrders);
            });
            return deferred.promise;
        };

        return {
            getActiveDrugOrders: getActiveDrugOrders,
            getConfig: getConfig,
            getPrescribedDrugOrders: getPrescribedDrugOrders
        };
    }]);