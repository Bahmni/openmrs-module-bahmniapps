'use strict';

angular.module('bahmni.adt')
    .service('queryService', ['$http', function ($http) {
        this.getResponseFromQuery = function (params) {
            return $http.get(Bahmni.Common.Constants.sqlUrl, {
                method: "GET",
                params: params,
                withCredentials: true
            });
        };
    }]);
