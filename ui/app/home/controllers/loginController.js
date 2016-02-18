'use strict';

angular.module('bahmni.home')
    .controller('LoginController', ['$rootScope', '$scope', '$window', '$location', 'sessionService', 'initialData', 'spinner', '$q', '$stateParams','$bahmniCookieStore', 'localeService', '$translate', 'userService', 'offlineService',
        function ($rootScope, $scope, $window, $location, sessionService, initialData, spinner, $q, $stateParams, $bahmniCookieStore, localeService, $translate, userService, offlineService) {
            var redirectUrl = $location.search()['from'];
            var landingPagePath = "/dashboard";
            var loginPagePath = "/login";
            var isOfflineApp = offlineService.isOfflineApp();
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
            }

            var redirectToLandingPageIfAlreadyAuthenticated = function () {
                sessionService.get().then(function (data) {
                    if (data.authenticated) {
                        $location.path(landingPagePath);
                    }
                });
            };

            if ($location.path() === loginPagePath) {
                redirectToLandingPageIfAlreadyAuthenticated();
            }
            var onSuccessfulAuthentication = function () {
                if (isOfflineApp) {
                    var encryptedPassword = offlineService.encrypt($scope.loginInfo.password, Bahmni.Common.Constants.encryptionType.SHA3);
                    $scope.loginInfo.password = encryptedPassword;
                    offlineService.setItem(Bahmni.Common.Constants.LoginInformation, $scope.loginInfo);
                }
                $bahmniCookieStore.remove(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, {
                    path: '/',
                    expires: 1
                });
                $rootScope.$broadcast('event:auth-loggedin');
                $scope.loginInfo.currentLocation = getLastLoggedinLocation();
            };

            $scope.login = function () {
                $scope.errorMessageTranslateKey = null;
                var deferrable = $q.defer();

                if(isOfflineApp && offlineService.getItem(Bahmni.Common.Constants.LoginInformation) &&
                    !offlineService.validateLoginInfo($scope.loginInfo)) {
                    $scope.errorMessageTranslateKey = "LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY";
                    return;
                }

                sessionService.loginUser($scope.loginInfo.username, $scope.loginInfo.password, $scope.loginInfo.currentLocation).then(
                    function () {
                        sessionService.loadCredentials().then(
                            onSuccessfulAuthentication,
                            function (error) {
                                $scope.errorMessageTranslateKey = error;
                                deferrable.reject(error);
                            }
                        ).then(function() {
                            $rootScope.currentUser.addDefaultLocale($scope.selectedLocale);
                            userService.savePreferences().then(
                                function() {deferrable.resolve()},
                                function(error) {deferrable.reject(error)}
                            );
                                deferrable.resolve();
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
