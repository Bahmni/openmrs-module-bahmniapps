'use strict';

angular.module('bahmni.common.domain')
    .factory('providerService', ['$http', function ($http) {
        var search = function (fieldValue) {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                params: { q: fieldValue, v: "full"},
                withCredentials: true
            });
        };

        var searchByUuid = function (uuid) {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                params: {
                    user: uuid
                },
                cache: false
            });
        };

        return {
            search: search,
            searchByUuid: searchByUuid
        };
    }]);
