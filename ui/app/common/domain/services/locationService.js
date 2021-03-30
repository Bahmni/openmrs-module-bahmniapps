'use strict';

angular.module('bahmni.common.domain')
    .factory('locationService', ['$http', '$bahmniCookieStore', function ($http, $bahmniCookieStore) {
        var getAllByTag = function (tags, operator) {
            return $http.get(Bahmni.Common.Constants.locationUrl, {
                params: {s: "byTags", tags: tags || "", v: "default", operator: operator || "ALL"},
                cache: true
            });
        };

        var getByUuid = function (locationUuid) {
            return $http.get(Bahmni.Common.Constants.locationUrl + "/" + locationUuid, {
                cache: true
            }).then(function (response) {
                return response.data;
            });
        };

        var getLoggedInLocation = function () {
            var cookie = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName);
            return getByUuid(cookie.uuid);
        };

        var getVisitLocation = function (locationUuid) {
            return $http.get(Bahmni.Common.Constants.bahmniVisitLocationUrl + "/" + locationUuid, {
                headers: {"Accept": "application/json"}
            });
        };

        var setSessionLocation = function (payload) {
            return $http.post(Bahmni.Common.Constants.RESTWS_V1 + '/session', payload, {
                withCredentials: true,
                headers: {"Accept": "application/json"}
            });
        };

        return {
            getAllByTag: getAllByTag,
            getLoggedInLocation: getLoggedInLocation,
            getByUuid: getByUuid,
            getVisitLocation: getVisitLocation,
            setSessionLocation: setSessionLocation
        };
    }]);
