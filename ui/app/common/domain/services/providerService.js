'use strict';

angular.module('bahmni.common.domain')
    .factory('providerService', ['$http', function ($http) {
        var search = function (fieldValue) {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                params: {q: fieldValue, v: "full"},
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

        var list = function (params) {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                cache: false,
                params: params
            });
        };

        var getProviderAttributes = function (providerUuid) {
            var url = Bahmni.Common.Constants.providerUrl + "/" + providerUuid + "/attribute";
            return $http.get(url, {
                method: "GET",
                cache: false
            });
        };

        return {
            search: search,
            searchByUuid: searchByUuid,
            list: list,
            getProviderAttributes: getProviderAttributes
        };
    }]);
