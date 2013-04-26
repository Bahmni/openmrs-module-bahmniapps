'use strict';

angular.module('infrastructure', [])
    .factory('configurationService', ['$http', '$rootScope', function ($http, $rootScope) {
        var getAll = function(){
            var url = $rootScope.openmrsUrl + "/ws/rest/v1/bahmnicore/conf";
            return $http.get(url, {
                method: "GET",
                withCredentials: true
            });
        }

        return {
            getAll : getAll
        };
}]);