'use strict';

angular.module('resources.visitService', [])
    .factory('visitService', ['$http', '$rootScope', function ($http, $rootScope) {

    var create = function (visit) {
        return $http.post($rootScope.openmrsUrl + "/ws/rest/v1/visit", visit,
            {
                withCredentials: true
            });
    };

    return {
        create: create
    };
}]);