'use strict';

angular.module('resources.patientAttributeType', [])

    .factory('patientAttributeType', ['$http', '$rootScope', function ($http, $rootScope) {
        var getAll = function () {
            return $http.get($rootScope.BaseUrl + "/ws/rest/v1/personattributetype?v=full",
                {method: "GET",
                    withCredentials: true
                });
        }
        return {
            getAll: getAll
        };
    }]);