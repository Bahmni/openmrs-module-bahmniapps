'use strict';

angular.module('bahmni.common.domain')
    .factory('locationService', ['$http', '$bahmniCookieStore','offlineService', 'offlineDbService', 'androidDbService',
        function ($http, $bahmniCookieStore, offlineService, offlineDbService, androidDbService ) {
        var getAllByTag = function (tags) {
            if(offlineService.isOfflineApp()) {
                if(offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
                return offlineDbService.getReferenceData('LoginLocations').then(function(loginLocations){
                    return {"data": loginLocations.value};
                });
            }
            return $http.get(Bahmni.Common.Constants.locationUrl, {
                params: {s: "byTags", q: tags || "", v:"default"},
                cache: true
            });
        };

        var getByUuid = function(locationUuid) {
            if(offlineService.isOfflineApp()) {
                if(offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
                return offlineDbService.getLocationByUuid(locationUuid).then(function(loginLocations){
                    return loginLocations;
                });
            }
            return $http.get(Bahmni.Common.Constants.locationUrl + "/" + locationUuid, {
                cache: true
            }).then(function (response) {
                return response.data;
            });
        };

        var getLoggedInLocation = function() {
            var cookie = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName);
            return getByUuid(cookie.uuid);
        };

        return {
            getAllByTag: getAllByTag,
            getLoggedInLocation: getLoggedInLocation,
            getByUuid: getByUuid
        };

    }]);
