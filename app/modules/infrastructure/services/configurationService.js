'use strict';

angular.module('infrastructure', [])
    .factory('configurationService', ['$http', '$rootScope', function ($http, $rootScope) {
        var bahmniRESTBaseURL = constants.openmrsUrl + "/ws/rest/v1/bahmnicore";

        var getAll = function(){
            var url = bahmniRESTBaseURL + "/conf";
            return $http.get(url, {
                withCredentials: true
            });
        }

        var getEncounterConfig = function() {
            return $http.get(bahmniRESTBaseURL + "/bahmniencounter/config", {
                params: {"callerContext" : "REGISTRATION_CONCEPTS"},
                withCredentials: true
            });
        }

        return {
            getAll : getAll,
            getEncounterConfig : getEncounterConfig
        };
}]);