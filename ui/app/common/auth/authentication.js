'use strict';

angular.module('authentication')
    .config(['$httpProvider', function ($httpProvider) {
        var interceptor = ['$rootScope', '$q', function ($rootScope, $q) {
            function success (response) {
                return response;
            }

            function error (response) {
                if (response.status === 401) {
                    $rootScope.$broadcast('event:auth-loginRequired');
                }
                return $q.reject(response);
            }

            return {
                response: success,
                responseError: error
            };
        }];
        $httpProvider.interceptors.push(interceptor);
    }]).run(['$rootScope', '$window', '$timeout', function ($rootScope, $window, $timeout) {
        $rootScope.$on('event:auth-loginRequired', function () {
            $timeout(function () {
                $window.location = "../home/index.html#/login";
            });
        });
    }]).service('sessionService', ['$rootScope', '$http', '$q', '$bahmniCookieStore', 'userService', '$window', function ($rootScope, $http, $q, $bahmniCookieStore, userService, $window) {
        var sessionResourcePath = Bahmni.Common.Constants.RESTWS_V1 + '/session?v=custom:(uuid)';

        var getAuthFromServer = function (username, password, otp) {
            var btoa = otp ? username + ':' + password + ':' + otp : username + ':' + password;
            return $http.get(sessionResourcePath, {
                headers: {'Authorization': 'Basic ' + window.btoa(btoa)},
                cache: false
            });
        };

        this.resendOTP = function (username, password) {
            var btoa = username + ':' + password;
            return $http.get(sessionResourcePath + '&resendOTP=true', {
                headers: {'Authorization': 'Basic ' + window.btoa(btoa)},
                cache: false
            });
        };

        var createSession = function (username, password, otp) {
            var deferrable = $q.defer();

            getAuthFromServer(username, password, otp).then(function (response) {
                if (response.status == 204) {
                    deferrable.resolve({"firstFactAuthorization": true});
                }
                deferrable.resolve(response.data);
            }, function (response) {
                if (response.status == 401) {
                    deferrable.reject('LOGIN_LABEL_WRONG_OTP_MESSAGE_KEY');
                } else if (response.status == 410) {
                    deferrable.reject('LOGIN_LABEL_OTP_EXPIRED');
                } else if (response.status == 429) { // Too many requests
                    deferrable.reject('LOGIN_LABEL_MAX_FAILED_ATTEMPTS');
                }
                deferrable.reject('LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY');
            });
            return deferrable.promise;
        };

        var hasAnyActiveProvider = function (providers) {
            return _.filter(providers, function (provider) {
                return (provider.retired == undefined || provider.retired == "false");
            }).length > 0;
        };

        var self = this;

        var destroySessionFromServer = function () {
            if ($rootScope.cookieExpiryTime && $rootScope.cookieExpiryTime > 0) {
                var currentTime = new Date();
                var expiryTime = new Date(currentTime.getTime() + $rootScope.cookieExpiryTime * 60000);
                var params = (decodeURIComponent($window.location.search.substring(1)));
                $bahmniCookieStore.put($rootScope.currentProvider.uuid, $window.location.pathname + (params ? '?' + params : '') + $window.location.hash, {path: '/', expires: expiryTime});
            }
            return $http.delete(sessionResourcePath);
        };

        var sessionCleanup = function () {
            delete $.cookie(Bahmni.Common.Constants.currentUser, null, {path: "/"});
            delete $.cookie(Bahmni.Common.Constants.currentUser, null, {path: "/"});
            delete $.cookie(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, null, {path: "/"});
            delete $.cookie(Bahmni.Common.Constants.grantProviderAccessDataCookieName, null, {path: "/"});
            $rootScope.currentUser = undefined;
        };

        this.destroy = function () {
            var deferrable = $q.defer();
            destroySessionFromServer().then(function () {
                sessionCleanup();
                deferrable.resolve();
            });
            return deferrable.promise;
        };

        this.loginUser = function (username, password, location, otp) {
            var deferrable = $q.defer();
            createSession(username, password, otp).then(function (data) {
                if (data.authenticated) {
                    $bahmniCookieStore.put(Bahmni.Common.Constants.currentUser, username, {path: '/', expires: 7});
                    if (location != undefined) {
                        $bahmniCookieStore.remove(Bahmni.Common.Constants.locationCookieName);
                        $bahmniCookieStore.put(Bahmni.Common.Constants.locationCookieName, {name: location.display, uuid: location.uuid}, {path: '/', expires: 7});
                    }
                    deferrable.resolve(data);
                } else if (data.firstFactAuthorization) {
                    deferrable.resolve(data);
                } else {
                    deferrable.reject('LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY');
                }
            }, function (errorInfo) {
                deferrable.reject(errorInfo);
            });
            return deferrable.promise;
        };

        this.get = function () {
            return $http.get(sessionResourcePath, { cache: false });
        };

        this.loadCredentials = function () {
            var deferrable = $q.defer();
            var currentUser = $bahmniCookieStore.get(Bahmni.Common.Constants.currentUser);
            if (!currentUser) {
                this.destroy().finally(function () {
                    $rootScope.$broadcast('event:auth-loginRequired');
                    deferrable.reject("No User in session. Please login again.");
                });
                return deferrable.promise;
            }
            userService.getUser(currentUser).then(function (data) {
                userService.getProviderForUser(data.results[0].uuid).then(function (providers) {
                    if (!_.isEmpty(providers.results) && hasAnyActiveProvider(providers.results)) {
                        $rootScope.currentUser = new Bahmni.Auth.User(data.results[0]);
                        $rootScope.currentUser.provider = providers.results[0];
                        var location = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName);
                        if (location) {
                            $rootScope.currentUser.currentLocation = location.name;
                        }
                        $rootScope.$broadcast('event:user-credentialsLoaded', data.results[0]);
                        deferrable.resolve(data.results[0]);
                    } else {
                        self.destroy();
                        deferrable.reject("YOU_HAVE_NOT_BEEN_SETUP_PROVIDER");
                    }
                },
               function () {
                   self.destroy();
                   deferrable.reject("COULD_NOT_GET_PROVIDER");
               });
            }, function () {
                self.destroy();
                deferrable.reject('Could not get roles for the current user.');
            });
            return deferrable.promise;
        };

        this.getLoginLocationUuid = function () {
            return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid : null;
        };

        this.changePassword = function (currentUserUuid, oldPassword, newPassword) {
            return $http({
                method: 'POST',
                url: Bahmni.Common.Constants.passwordUrl,
                data: {
                    "oldPassword": oldPassword,
                    "newPassword": newPassword
                },
                headers: {'Content-Type': 'application/json'}
            });
        };

        this.loadProviders = function (userInfo) {
            return $http.get(Bahmni.Common.Constants.providerUrl, {
                method: "GET",
                params: {
                    user: userInfo.uuid
                },
                cache: false
            }).success(function (data) {
                var providerUuid = (data.results.length > 0) ? data.results[0].uuid : undefined;
                $rootScope.currentProvider = { uuid: providerUuid };
            });
        };

        this.updateSession = function (location, locale) {
            var requestData = {
                "sessionLocation": location.uuid
            };
            if (locale) {
                requestData.locale = locale;
            }
            return $http({
                method: 'POST',
                url: Bahmni.Common.Constants.RESTWS_V1 + '/session',
                data: requestData,
                headers: {'Content-Type': 'application/json'}
            }).then(function (response) {
                $bahmniCookieStore.remove(Bahmni.Common.Constants.locationCookieName);
                $bahmniCookieStore.put(Bahmni.Common.Constants.locationCookieName, {name: location.display, uuid: location.uuid}, {path: '/', expires: 7});
            });
        };
    }]).factory('authenticator', ['$rootScope', '$q', '$window', 'sessionService', function ($rootScope, $q, $window, sessionService) {
        var authenticateUser = function () {
            var defer = $q.defer();
            var sessionDetails = sessionService.get();
            sessionDetails.then(function (response) {
                if (response.data.authenticated) {
                    defer.resolve();
                } else {
                    defer.reject('User not authenticated');
                    $rootScope.$broadcast('event:auth-loginRequired');
                }
            });
            return defer.promise;
        };

        return {
            authenticateUser: authenticateUser
        };
    }]).directive('logOut', ['$rootScope', 'sessionService', '$window', 'configurationService', 'auditLogService', function ($rootScope, sessionService, $window, configurationService, auditLogService) {
        function logoutUser () {
            auditLogService.log(undefined, 'USER_LOGOUT_SUCCESS', undefined, 'MODULE_LABEL_LOGOUT_KEY').then(function () {
                sessionService.destroy().then(function () {
                    $window.location = "../home/index.html#/login";
                });
            });
        }

        function handleKeyPress (event) {
            if ((event.metaKey || event.ctrlKey) && event.key === $rootScope.quickLogoutComboKey) {
                logoutUser();
            }
        }
        return {
            link: function (scope, element) {
                element.bind('click', function () {
                    scope.$apply(function () {
                        logoutUser();
                    });
                });
                $window.addEventListener('keydown', handleKeyPress);
                scope.$on('$destroy', function () {
                    $window.removeEventListener('keydown', handleKeyPress);
                });
            }
        };
    }])
    .directive('btnUserInfo', [function () {
        return {
            restrict: 'CA',
            link: function (scope, elem) {
                elem.bind('click', function (event) {
                    $(this).next().toggleClass('active');
                    event.stopPropagation();
                });
                $(document).find('body').bind('click', function () {
                    $(elem).next().removeClass('active');
                });
            }
        };
    }
    ]);
