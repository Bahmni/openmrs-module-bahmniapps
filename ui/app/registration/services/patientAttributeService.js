'use strict';

angular.module('bahmni.registration')
    .factory('patientAttributeService', ['$http', 'offlineService', '$q', function ($http, offlineService, $q) {
        var urlMap;

        var init = function () {
            urlMap = {
                "personName": Bahmni.Common.Constants.bahmniSearchUrl + "/personname",
                "personAttribute": Bahmni.Common.Constants.bahmniSearchUrl + "/personattribute"
            };
        };
        init();

        var search = function (fieldName, query, type) {
            if (offlineService.isOfflineApp()) {
                return $q.when({ data: {} });
            }
            var url = urlMap[type];
            var queryWithoutTrailingSpaces = query.trimLeft();

            return $http.get(url, {
                method: "GET",
                params: {q: queryWithoutTrailingSpaces, key: fieldName },
                withCredentials: true
            });
        };

        return {
            search: search
        };
    }]);
