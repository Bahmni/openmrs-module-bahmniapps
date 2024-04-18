'use strict';

angular.module('bahmni.home')
    .controller('DashboardController', ['$scope', '$state', 'appService', 'locationService', 'spinner', '$bahmniCookieStore', '$window', '$q', 'sessionService',
        function ($scope, $state, appService, locationService, spinner, $bahmniCookieStore, $window, $q, sessionService) {
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

            var setCurrentLoginLocationForUser = function () {
                const currentLoginLocation = getCurrentLocation();
                if (currentLoginLocation) {
                    $scope.selectedLocationUuid = getCurrentLocation().uuid;
                } else {
                    $scope.selectedLocationUuid = null;
                }
            };

            var init = function () {
                const loginLocations = localStorage.getItem("loginLocations");
                if (loginLocations) {
                    $scope.locations = JSON.parse(loginLocations);
                    setCurrentLoginLocationForUser();
                    return;
                }
                return locationService.getAllByTag("Login Location").then(function (response) {
                    $scope.locations = response.data.results;
                    setCurrentLoginLocationForUser();
                });
            };

            var getLocationFor = function (uuid) {
                return _.find($scope.locations, function (location) {
                    return location.uuid === uuid;
                });
            };

            $scope.isCurrentLocation = function (location) {
                const currentLocation = getCurrentLocation();
                if (currentLocation) {
                    return getCurrentLocation().uuid === location.uuid;
                } else {
                    return false;
                }
            };

            $scope.onLocationChange = function () {
                var selectedLocation = getLocationFor($scope.selectedLocationUuid);
                sessionService.updateSession({ name: selectedLocation.display, uuid: selectedLocation.uuid }, null).then(function () {
                    $window.location.reload();
                });
            };

            $scope.changePassword = function () {
                $state.go('changePassword');
            };

            return spinner.forPromise($q.all(init()));
        }]);
