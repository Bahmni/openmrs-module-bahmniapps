'use strict';

angular.module('bahmni.common.domain')
    .factory('locationService', ['$bahmniCookieStore', 'offlineService', 'offlineDbService', '$q',
        function ($bahmniCookieStore, offlineService, offlineDbService, $q) {
            var getAllByTag = function (tags) {
                if (offlineService.getItem('LoginInformation') != null) {
                    var obj = {"data": {"results": [offlineService.getItem('LoginInformation').currentLocation]}};
                    return $q.when(obj);
                }
                return offlineDbService.getReferenceData('LoginLocations').then(function (loginLocations) {
                    if(!loginLocations){
                        return $q.reject("Offline data not set up");
                    }
                    return {"data": loginLocations.value};
                });
            };

            var getByUuid = function (locationUuid) {
                return offlineDbService.getLocationByUuid(locationUuid).then(function (loginLocations) {
                    return loginLocations;
                });
            };

            var getLoggedInLocation = function () {
                var cookie = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName);
                return getByUuid(cookie.uuid);
            };

            return {
                getAllByTag: getAllByTag,
                getLoggedInLocation: getLoggedInLocation,
                getByUuid: getByUuid
            };

        }]);
