'use strict';

angular.module('bahmni.home')
    .controller('LoginController', ['$rootScope', '$scope', '$window', '$location', 'sessionService', 'initialData', 'spinner', '$q', '$stateParams','$bahmniCookieStore',
        function ($rootScope, $scope, $window, $location, sessionService, initialData, spinner, $q, $stateParams,$bahmniCookieStore) {
            var landingPagePath = "/dashboard";
            var loginPagePath = "/login";
            $scope.locations = initialData.locations;
            $scope.loginInfo = {};

            var getLoginLocationUuid = function(){
                return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid : null;
            };
            var getLastLoggedinLocation = function () {
                return _.find(initialData.locations,function(location){
                    return location.uuid === getLoginLocationUuid();
                })
            };

            $scope.loginInfo.currentLocation = getLastLoggedinLocation();

            if ($stateParams.showLoginMessage) {
                $scope.errorMessage = "You are not authenticated or your session expired. Please login.";
            }

            var redirectToLandingPageIfAlreadyAuthenticated = function () {
                sessionService.get().success(function (data) {
                    if (data.authenticated) {
                        $location.path(landingPagePath);
                    }
                });
            };

            if ($location.path() === loginPagePath) {
                redirectToLandingPageIfAlreadyAuthenticated();
            }

            $scope.login = function () {
                $scope.errorMessage = null;
                var deferrable = $q.defer();
                sessionService.loginUser($scope.loginInfo.username, $scope.loginInfo.password, $scope.loginInfo.currentLocation).then(
                    function () {
                        sessionService.loadCredentials().then(
                            function () {
                                $rootScope.$broadcast('event:auth-loggedin');
                                $scope.loginInfo.currentLocation = getLastLoggedinLocation();
                                deferrable.resolve();
                            },
                            function (error) {
                                deferrable.reject(error);
                            }
                        )
                    },
                    function (error) {
                        $scope.errorMessage = error;
                        deferrable.reject(error);
                    }
                );
                spinner.forPromise(deferrable.promise).then(
                    function () {
                        $location.path(landingPagePath);
                    }
                )
            }

        }]);
