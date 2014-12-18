'use strict';

angular.module('bahmni.common.uiHelper')
    .controller('DashboardController', ['$rootScope', '$scope', '$state', 'appService', 'locationService', 'spinner', '$cookieStore', '$window',
        function ($rootScope, $scope, $state, appService, locationService, spinner, $cookieStore, $window) {
            $scope.appExtensions = appService.getAppDescriptor().getExtensions($state.current.data.extensionPointId, "link") || [];
            $scope.selectedLocationUuid = {};

            var getCurrentLocation = function () {
                return $cookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $cookieStore.get(Bahmni.Common.Constants.locationCookieName) : null;
            };

            var init = function () {
                return locationService.getAllByTag("Login Location").then(function (response) {
                        $scope.locations = response.data.results;
                        $scope.selectedLocationUuid = getCurrentLocation().uuid;
                    }
                );
            };

            var getLocationFor = function(uuid){
                return _.find($scope.locations, function(location){
                    return location.uuid == uuid;
                })
            };

            $scope.isCurrentLocation = function (location) {
                return getCurrentLocation().uuid === location.uuid;
            };

            $scope.onLocationChange = function () {
                var selectedLocation = getLocationFor($scope.selectedLocationUuid);
                $cookieStore.remove(Bahmni.Common.Constants.locationCookieName);
                $cookieStore.put(Bahmni.Common.Constants.locationCookieName, {name: selectedLocation.display, uuid: selectedLocation.uuid},{path: '/', expires: 7});
                $window.location.reload();
            };

            return spinner.forPromise(init());
        }]);