'use strict';

angular.module('infrastructure', [])
    .factory('configurationService', ['$http', '$q', function ($http, $q) {
        var bahmniCoreRESTBaseURL = constants.openmrsUrl + "/ws/rest/v1/bahmnicore";
        var idgenConfigurationURL = constants.openmrsUrl + "/ws/rest/v1/idgen";

        var getAll = function () {
            var url = bahmniCoreRESTBaseURL + "/conf";
            return $http.get(url, {
                withCredentials: true
            });
        };

        var getEncounterConfig = function () {
            return $http.get(bahmniCoreRESTBaseURL + "/bahmniencounter/config", {
                params: {"callerContext": "REGISTRATION_CONCEPTS"},
                withCredentials: true
            });
        };

        var getPatientConfig = function () {
            return $http.get(constants.baseOpenMRSRESTURL + "/personattributetype?v=full", {
                withCredentials: true
            });
        };

        var getAddressLevels = function () {
            return $http.get(constants.openmrsUrl + "/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form", {
                withCredentials: true
            });
        };

        var getIdentifierSourceConfig = function () {
            var defer = $q.defer();
            var response = $http.get(idgenConfigurationURL + "/identifiersources", {
                withCredentials: true
            });
            response.success(function (result) {
                defer.resolve({identifierSources: result});
            });
            return defer.promise;
        };

        return {
            getAll: getAll,
            getEncounterConfig: getEncounterConfig,
            getPatientConfig: getPatientConfig,
            getAddressLevels: getAddressLevels,
            getIdentifierSourceConfig: getIdentifierSourceConfig
        };
    }
    ]);
