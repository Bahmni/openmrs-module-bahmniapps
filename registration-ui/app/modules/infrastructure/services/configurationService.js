'use strict';

angular.module('infrastructure', [])
    .factory('configurationService', ['$http', '$rootScope', function ($http) {
        var bahmniRESTBaseURL = constants.openmrsUrl + "/ws/rest/v1/bahmnicore";

        var getAll = function () {
            var url = bahmniRESTBaseURL + "/conf";
            return $http.get(url, {
                withCredentials: true
            });
        };

        var getEncounterConfig = function () {
            return $http.get(bahmniRESTBaseURL + "/bahmniencounter/config", {
                params: {"callerContext": "REGISTRATION_CONCEPTS"},
                withCredentials: true
            });
        };

        var getPatientConfig = function () {
            return $http.get(bahmniRESTBaseURL + "/patient/config", {
                withCredentials: true
            });
        };

        var getAddressLevels = function () {
            return $http.get(constants.openmrsUrl + "/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form", {
                withCredentials: true
            });
        };

        return {
            getAll: getAll,
            getEncounterConfig: getEncounterConfig,
            getPatientConfig: getPatientConfig,
            getAddressLevels: getAddressLevels
        };
    }]);