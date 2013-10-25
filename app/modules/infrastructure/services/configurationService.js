'use strict';

angular.module('infrastructure')
    .factory('configurationService', ['$http', '$rootScope', function ($http) {
        var bahmniRESTBaseURL = constants.openmrsUrl + "/ws/rest/v1/bahmnicore";

        var getAll = function () {
            var url = bahmniRESTBaseURL + "/conf";
            return $http.get(url, {
                withCredentials: true
            });
        };
        

        return {
            getAll: getAll
        };
    }]);