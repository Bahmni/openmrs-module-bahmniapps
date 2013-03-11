'use strict';

angular.module('resources.patient', [])

    .factory('patient', ['$http', '$rootScope', function ($http, $rootScope) {
        var search = function (query) {
            return $http.get($rootScope.BaseUrl + "/ws/rest/v1/patient", {
                method: "GET",
                params: {q: query, v: "full"},
                withCredentials: true
            });
        }

        var create = function (patient) {
            return $http.post($rootScope.BaseUrl + "/ws/rest/v1/raxacore/patient", patient,
                {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
        }
        return {
            search: search,
            create: create
        };
    }]);
