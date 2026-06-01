'use strict';

angular.module('bahmni.home')
    .controller('LoginController', ['$rootScope', '$scope', '$window', '$location', 'sessionService', 'initialData', 'spinner', '$q', '$stateParams', '$bahmniCookieStore', 'localeService', '$translate', 'userService', 'auditLogService', '$state',
        function ($rootScope, $scope, $window, $location, sessionService, initialData, spinner, $q, $stateParams, $bahmniCookieStore, localeService, $translate, userService, auditLogService, $state) {
            var redirectUrl = $location.search()['from'];
            var landingPagePath = "/dashboard";
            var loginPagePath = "/login";
            $scope.locations = initialData.locations;
            $scope.loginInfo = {};
            var localeLanguages = [];

            var getLocalTimeZone = function () {
                var currentLocalTime = new Date().toString();
                var localTimeZoneList = currentLocalTime.split(" ");
                var localTimeZone = localTimeZoneList[localTimeZoneList.length - 1];
                localTimeZone = localTimeZone.substring(1, localTimeZone.length - 1);
                return localTimeZone;
            };

            var findLanguageByLocale = function (localeCode) {
                return _.find(localeLanguages, function (localeLanguage) {
                    return localeLanguage.code == localeCode;
                });
            };

            var logAuditForLoginAttempts = function (eventType, isFailedEvent) {
                if ($scope.loginInfo.username) {
                    var messageParams = isFailedEvent ? {userName: $scope.loginInfo.username} : undefined;
                    auditLogService.log(undefined, eventType, messageParams, 'MODULE_LABEL_LOGIN_KEY');
                }
            };

            var promise = localeService.allowedLocalesList();
            localeService.serverDateTime().then(function (response) {
                var serverTime = response.data.date;
                var offset = response.data.offset;
                var localTime = new Date().toLocaleString();
                var localtimeZone = getLocalTimeZone();
                var localeTimeZone = localTime + " " + localtimeZone;
                $scope.timeZoneObject = { serverTime: serverTime, localeTimeZone: localeTimeZone};
                if (offset && !new Date().toString().includes(offset)) {
                    $scope.warning = "Warning";
                    $scope.warningMessage = "WARNING_SERVER_TIME_ZONE_MISMATCH";
                }
            });

            localeService.getLoginText().then(function (response) {
                $scope.logo = response.data.loginPage.logo;
                $scope.bottomLogos = response.data.loginPage.bottomLogos;
                $scope.headerText = response.data.loginPage.showHeaderText;
                $scope.titleText = response.data.loginPage.showTitleText;
                $scope.helpLink = response.data.helpLink.url;
                $rootScope.cookieExpirationTime = response.data.loggedInUrlCookieExpirationTimeInMinutes;
            });

            localeService.getLocalesLangs().then(function (response) {
                localeLanguages = response.data.locales;
            }).finally(function () {
                promise.then(function (response) {
                    var localeList = response.data.replace(/\s+/g, '').split(',');
                    $scope.locales = [];
                    _.forEach(localeList, function (locale) {
                        var localeLanguage = findLanguageByLocale(locale);
                        if (_.isUndefined(localeLanguage)) {
                            $scope.locales.push({"code": locale, "nativeName": locale});
                        } else {
                            $scope.locales.push(localeLanguage);
                        }
                    });
                    $scope.selectedLocale = $translate.use() ? $translate.use() : $scope.locales[0].code;
                });
            });

            localeService.defaultLocale().then(function (response) {
                localStorage.setItem("openmrsDefaultLocale", response.data || "en");
            });

            $scope.isSupportedBrowser = function () {
                var userAgent = $window.navigator.userAgent;
                if (userAgent.indexOf("Chrome") !== -1 || userAgent.indexOf("Firefox") !== -1) {
                    return true;
                }
                return false;
            };

            $scope.$watch('selectedLocale', function () {
                $translate.use($scope.selectedLocale);
            });

            var getLoginLocationUuid = function () {
                return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid : null;
            };
            var getLastLoggedinLocation = function () {
                return _.find(initialData.locations, function (location) {
                    return location.uuid === getLoginLocationUuid();
                });
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
                $bahmniCookieStore.remove(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, {
                    path: '/',
                    expires: 1
                });
                $rootScope.$broadcast('event:auth-loggedin');
                $scope.loginInfo.currentLocation = getLastLoggedinLocation();
            };

            var checkIfUserHasProviderAttributes = function () {
                return $rootScope.currentUser.provider && $rootScope.currentUser.provider.attributes && $rootScope.currentUser.provider.attributes.length > 0;
            };

            var saveUserAssignedLocationsToLocalStorage = function () {
                var userAssignedLocations = $rootScope.currentUser.provider.attributes
                  .filter(function (attribute) {
                      return attribute.attributeType.display === "Login Locations";
                  })
                  .map(function (attribute) {
                      return { display: attribute.value.name, uuid: attribute.value.uuid };
                  });

                if (userAssignedLocations.length > 0) {
                    localStorage.setItem("loginLocations", JSON.stringify(userAssignedLocations));
                } else {
                    localStorage.removeItem("loginLocations");
                }
            };

            $scope.login = function () {
                $scope.errorMessageTranslateKey = null;
                var deferrable = $q.defer();

                var ensureNoSessionIdInRoot = function () {
                    // See https://bahmni.mingle.thoughtworks.com/projects/bahmni_emr/cards/2934
                    // The cookie should ideally not be set at root, and is interfering with
                    // authentication for reporting. This seems to be one of the best places to remove it.
                    $bahmniCookieStore.remove(Bahmni.Common.Constants.JSESSIONID, {
                        path: '/',
                        expires: 1
                    });
                };

                sessionService.loginUser($scope.loginInfo.username, $scope.loginInfo.password, $scope.loginInfo.currentLocation, $scope.loginInfo.otp).then(
                    function (data) {
                        ensureNoSessionIdInRoot();
                        if (data && data.firstFactAuthorization) {
                            $scope.showOTP = true;
                            deferrable.resolve(data);
                            return;
                        }
                        sessionService.loadCredentials().then(function () {
                            onSuccessfulAuthentication();
                            $rootScope.currentUser.addDefaultLocale($scope.selectedLocale);
                            userService.savePreferences().then(
                                    function () { deferrable.resolve(); },
                                    function (error) { deferrable.reject(error); }
                                );
                            logAuditForLoginAttempts("USER_LOGIN_SUCCESS");
                            if (data) {
                                const providerUuid = data.currentProvider.uuid;
                                if ($bahmniCookieStore.get(providerUuid) !== null) {
                                    $window.location = $bahmniCookieStore.get(providerUuid);
                                }
                            }
                        }, function (error) {
                            $scope.errorMessageTranslateKey = error;
                            deferrable.reject(error);
                            logAuditForLoginAttempts("USER_LOGIN_FAILED", true);
                        });
                    },
                    function (error) {
                        $scope.errorMessageTranslateKey = error;
                        if (error === 'LOGIN_LABEL_MAX_FAILED_ATTEMPTS' || error == 'LOGIN_LABEL_OTP_EXPIRED') {
                            deleteUserCredentialsAndShowLoginPage();
                        } else if (error == 'LOGIN_LABEL_WRONG_OTP_MESSAGE_KEY') {
                            delete $scope.loginInfo.otp;
                        }
                        deferrable.reject(error);
                        logAuditForLoginAttempts("USER_LOGIN_FAILED", true);
                    }
                );

                var deleteUserCredentialsAndShowLoginPage = function () {
                    $scope.showOTP = false;
                    delete $scope.loginInfo.otp;
                    delete $scope.loginInfo.username;
                    delete $scope.loginInfo.password;
                };

                $scope.resendOTP = function () {
                    var promise = sessionService.resendOTP($scope.loginInfo.username, $scope.loginInfo.password);
                    spinner.forPromise(promise);
                    promise.then(function () {
                        $scope.errorMessageTranslateKey = 'LOGIN_LABEL_RESEND_SUCCESS';
                    }, function (response) {
                        if (response.status === 429) {
                            $scope.errorMessageTranslateKey = 'LOGIN_LABEL_MAX_RESEND_ATTEMPTS';
                            deleteUserCredentialsAndShowLoginPage();
                        }
                    });
                };

                var urlMatches = function (domain, url) {
                    if (!domain.trim().endsWith("/")) {
                        return url.startsWith(domain.trim().concat("/"));
                    } else {
                        return url.startsWith(domain.trim());
                    }
                };

                spinner.forPromise(deferrable.promise).then(
                    function (data) {
                        if (data) return;
                        if (redirectUrl) {
                            userService.allowedDomains(redirectUrl).then(function (wlDomains) {
                                var domains = wlDomains || [];
                                domains = domains.concat($window.location.origin);
                                var res = domains.find(function (dUrl) { return urlMatches(dUrl, redirectUrl); });
                                if (res) {
                                    $window.location.replace(redirectUrl);
                                } else {
                                    $location.url(landingPagePath);
                                }
                            });
                        } else {
                            if (checkIfUserHasProviderAttributes()) {
                                saveUserAssignedLocationsToLocalStorage();
                            } else {
                                localStorage.removeItem("loginLocations");
                            }
                            $state.go('loginLocation', {});
                        }
                    }
                );
            };
        }]);
