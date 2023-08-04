'use strict';

angular.module('bahmni.common.domain')
    .factory('providerService', ['$http', 'appService', function ($http, appService) {
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

        var getAttributesForProvider = function (providerUuid) {
            var providerAttributeUrl = appService.getAppDescriptor().formatUrl(Bahmni.Common.Constants.providerAttributeUrl, {'providerUuid': providerUuid});
            return $http.get(providerAttributeUrl, {
                method: "GET",
                withCredentials: true,
                cache: false
            });
        };

        return {
            search: search,
            searchByUuid: searchByUuid,
            list: list,
            getAttributesForProvider: getAttributesForProvider
        };
    }]);
