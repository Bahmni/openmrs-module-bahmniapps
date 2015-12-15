'use strict';

angular.module('bahmni.home')
    .controller('LoginController', ['$rootScope', '$scope', '$window', '$location', 'sessionService', 'initialData', 'spinner', '$q', '$stateParams','$bahmniCookieStore', 'localeService', '$translate', 'userService',
        function ($rootScope, $scope, $window, $location, sessionService, initialData, spinner, $q, $stateParams, $bahmniCookieStore, localeService, $translate, userService) {
            var redirectUrl = $location.search()['from'];
            var landingPagePath = "/dashboard";
            var loginPagePath = "/login";
            $scope.locations = initialData.locations;
            $scope.loginInfo = {};

            var promise = localeService.allowedLocalesList();
            promise.then(function (response) {
                $scope.locales = response.data.replace(/\s+/g, '').split(',');
                $scope.selectedLocale = $translate.use()? $translate.use() : $scope.locales[0];
            });

            $scope.$watch('selectedLocale', function(){
                $translate.use($scope.selectedLocale);
            });

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
                $scope.errorMessageTranslateKey = "LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY";
            };

            var redirectToLandingPageIfAlreadyAuthenticated = function () {
                sessionService.get().then(function (data) {
                    if (data.authenticated) {
                        $location.path(landingPagePath);
                    }
                });
            };

            if ($location.path() === loginPagePath) {
                redirectToLandingPageIfAlreadyAuthenticated();
            };

            $scope.login = function () {
                $scope.errorMessageTranslateKey = null;
                var deferrable = $q.defer();
                sessionService.loginUser($scope.loginInfo.username, $scope.loginInfo.password, $scope.loginInfo.currentLocation).then(
                    function () {
                        sessionService.loadCredentials().then(
                            function () {
                                $bahmniCookieStore.remove(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, {path: '/', expires: 1});
                                $rootScope.$broadcast('event:auth-loggedin');
                                $scope.loginInfo.currentLocation = getLastLoggedinLocation();
                            },
                            function (error) {
                                $scope.errorMessageTranslateKey = error;
                                deferrable.reject(error);
                            }
                        ).then(function() {
                            $rootScope.currentUser.addDefaultLocale($scope.selectedLocale);
                            userService.savePreferences().then(
                                function() {deferrable.resolve()},
                                function(error) {deferrable.reject(error)}
                            )
                        })
                    },
                    function (error) {
                        $scope.errorMessageTranslateKey = error;
                        deferrable.reject(error);
                    }
                );
                spinner.forPromise(deferrable.promise).then(
                    function () {
                        if (redirectUrl) {
                            $window.location = redirectUrl;
                        } else {
                            $location.path(landingPagePath);
                        }
                    }
                )
            }

        }]);
