'use strict';

angular.module('bahmni.home')
    .controller('DashboardController', ['$scope', '$state', 'appService', 'locationService', 'spinner', '$bahmniCookieStore', '$window', '$q',
        function ($scope, $state, appService, locationService, spinner, $bahmniCookieStore, $window, $q) {
            $scope.appExtensions = appService.getAppDescriptor().getExtensions($state.current.data.extensionPointId, "link") || [];
            $scope.selectedLocationUuid = {};

            var isOnline = function () {
                return $window.navigator.onLine;
            };

            $scope.isVisibleExtension = function (extension) {
                return extension.exclusiveOnlineModule ? isOnline() : extension.exclusiveOfflineModule ? !isOnline() : true;
            };

            var getCurrentLocation = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) : null;
            };

            var init = function () {
                return locationService.getAllByTag("Login Location").then(function (response) {
                    $scope.locations = response.data.results;
                    $scope.selectedLocationUuid = getCurrentLocation().uuid;
                    return getCurrentLocation().uuid;
                }
                ).then(function (response) {
                    return locationService.setSessionLocation({ sessionLocation: response});
                }
                );
            };

            var getLocationFor = function (uuid) {
                return _.find($scope.locations, function (location) {
                    return location.uuid === uuid;
                });
            };
            var updateLocationCookie = function (selectedLocation) {
                $bahmniCookieStore.remove(Bahmni.Common.Constants.locationCookieName);
                $bahmniCookieStore.put(Bahmni.Common.Constants.locationCookieName, {
                    name: selectedLocation.display,
                    uuid: selectedLocation.uuid
                }, { path: '/', expires: 7 });
                $window.location.reload();
            };
            $scope.isCurrentLocation = function (location) {
                return getCurrentLocation().uuid === location.uuid;
            };

            $scope.onLocationChange = function () {
                var selectedLocation = getLocationFor($scope.selectedLocationUuid);
                locationService.setSessionLocation({ sessionLocation: selectedLocation.uuid}).then(function (response) {
                    updateLocationCookie(selectedLocation);
                    return response;
                });
            };

            $scope.changePassword = function () {
                $state.go('changePassword');
            };

            return spinner.forPromise($q.all(init()));
        }]);
