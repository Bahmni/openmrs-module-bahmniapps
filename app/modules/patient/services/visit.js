'use strict';

angular.module('resources.visit', [])
    .factory('visit', ['$http', '$rootScope', function ($http, $rootScope) {

    var create = function (visit) {
        return $http.post($rootScope.BaseUrl + "/ws/rest/v1/visit", visit,
            {
                withCredentials: true
            });
    };

    return {
        create: create
    };
}]);