'use strict';

angular.module('resources.visitService', [])
    .factory('visitService', ['$http', '$rootScope', function ($http, $rootScope) {

    var create = function (visit) {
        return $http.post(constants.openmrsUrl + "/ws/rest/v1/bahmnivisit", visit,
            {
                withCredentials: true
            });
    };

    return {
        create: create
    };
}]);