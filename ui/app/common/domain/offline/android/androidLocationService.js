'use strict';

angular.module('bahmni.common.domain')
    .factory('locationService', ['$bahmniCookieStore', 'offlineService', 'androidDbService', '$q',
        function ($bahmniCookieStore, offlineService, androidDbService, $q) {
            var getAllByTag = function (tags) {
                if (offlineService.getItem('LoginInformation') != null && !offlineService.getItem("allowMultipleLoginLocation")) {
                    var obj = {"data": {"results": [offlineService.getItem('LoginInformation').currentLocation]}};
                    return $q.when(obj);
                }
                return androidDbService.getReferenceData('LoginLocations').then(function (loginLocations) {
                    if (!loginLocations) {
                        var msg = offlineService.getItem("networkError") || "Offline data not set up";
                        return $q.reject(msg);
                    }
                    return loginLocations;
                });
            };

            var getByUuid = function (locationUuid) {
                return androidDbService.getLocationByUuid(locationUuid).then(function (loginLocations) {
                    return loginLocations;
                });
            };

            var getLoggedInLocation = function () {
                var cookie = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName);
                return getByUuid(cookie.uuid);
            };

            var getVisitLocation = function (locationUuid) {
                return $q.when({});
            };

            return {
                getAllByTag: getAllByTag,
                getLoggedInLocation: getLoggedInLocation,
                getByUuid: getByUuid,
                getVisitLocation: getVisitLocation
            };
        }]);
