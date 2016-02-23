'use strict';

angular.module('authentication')
    .config(function ($httpProvider) {
        var interceptor = ['$rootScope', '$q', function ($rootScope, $q) {
            function success(response) {
                return response;
            }

            function error(response) {
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
    }).run(['$rootScope', '$window', '$timeout', function ($rootScope, $window, $timeout) {
        $rootScope.$on('event:auth-loginRequired', function () {
            $timeout(function(){
                $window.location = "../home/index.html#/login";
            });
        });
    }]).service('sessionService', ['$rootScope', '$http', '$q', '$bahmniCookieStore', 'userService', 'offlineService', function ($rootScope, $http, $q, $bahmniCookieStore, userService, offlineService) {
        var sessionResourcePath = Bahmni.Common.Constants.RESTWS_V1 + '/session?v=custom:(uuid)', offlineApp = offlineService.isOfflineApp(), authenticationResponse = 'authenticationResponse', previousUser = 'previousUser', previousUserInfo = 'previousUserInfo';

        var getAuthFromServer = function(username, password) {
            return $http.get(sessionResourcePath, {
                headers: {'Authorization': 'Basic ' + window.btoa(username + ':' + password)},
                cache: false
            });
        };

        var createSession = function(username, password){
            var deferrable = $q.defer();

            if(offlineApp && offlineService.getItem(authenticationResponse)){
                deferrable.resolve(offlineService.getItem(authenticationResponse));
            } else {
                getAuthFromServer(username, password).success(function(data) {
                    if(offlineApp) {
                        if(data.authenticated == true) {
                            offlineService.setItem(authenticationResponse, data);
                        }
                    }
                    deferrable.resolve(data);
                }).error(function(){
                    deferrable.reject('LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY');
                });
            }
            return deferrable.promise;
        };

        var hasAnyActiveProvider = function (providers) {
            return _.filter(providers, function (provider) {
                    return (provider.retired == undefined || provider.retired == "false")
                }).length > 0;
        };

        var self = this;

        var destroySessionFromServer = function() {
            return $http.delete(sessionResourcePath);
        };

        var sessionCleanup = function() {
            delete $.cookie(Bahmni.Common.Constants.currentUser, null, {path: "/"});
            delete $.cookie(Bahmni.Common.Constants.currentUser, null, {path: "/"});
            delete $.cookie(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, null, {path: "/"});
            delete $.cookie(Bahmni.Common.Constants.grantProviderAccessDataCookieName, null, {path: "/"});
            $rootScope.currentUser = undefined;
        };

        this.destroy = function(){
            var deferrable = $q.defer();
            if(offlineApp) {
                sessionCleanup();
            } else {
                destroySessionFromServer().then(function(){
                    sessionCleanup();
                });
            }
            deferrable.resolve();
            return deferrable.promise;
        };

        this.loginUser = function(username, password, location) {
            var deferrable = $q.defer();
            createSession(username,password).then(function(data) {
                if (data.authenticated) {
                    $bahmniCookieStore.put(Bahmni.Common.Constants.currentUser, username, {path: '/', expires: 7});
                    if(location != undefined) {
                        $bahmniCookieStore.remove(Bahmni.Common.Constants.locationCookieName);
                        $bahmniCookieStore.put(Bahmni.Common.Constants.locationCookieName, {name: location.display, uuid: location.uuid}, {path: '/', expires: 7});
                    }
                    deferrable.resolve();
                } else {
                   deferrable.reject('LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY');
                }
            }, function(){
                deferrable.reject('LOGIN_LABEL_LOGIN_ERROR_MESSAGE_KEY');
            });
            return deferrable.promise;
        };

        this.get = function () {
            if(offlineApp) {
                return $q.when({data:offlineService.getItem('authenticationResponse')});
            }
            return $http.get(sessionResourcePath, { cache: false });
        };

        this.loadCredentials = function () {
            var deferrable = $q.defer();
            var currentUser = $bahmniCookieStore.get(Bahmni.Common.Constants.currentUser);
            if(!currentUser) {
                this.destroy().finally(function() {
                    $rootScope.$broadcast('event:auth-loginRequired');
                    deferrable.reject("No User in session. Please login again.");
                });
                return deferrable.promise;
            }
            userService.getUser(currentUser).then(function(data) {
                userService.getProviderForUser(data.results[0].uuid).then(function(providers){
                        if(!_.isEmpty(providers.results) && hasAnyActiveProvider(providers.results)){
                            $rootScope.currentUser = new Bahmni.Auth.User(data.results[0]);
                            $rootScope.currentUser.currentLocation = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).name;
                            if(offlineApp){
                                offlineService.setItem(previousUser, $rootScope.currentUser);
                                offlineService.setItem(previousUserInfo, data.results[0]);
                            }
                            $rootScope.$broadcast('event:user-credentialsLoaded', data.results[0])
                            deferrable.resolve(data.results[0]);
                        }else{
                            self.destroy();
                            deferrable.reject('You have not been setup as a Provider, please contact administrator.');
                        }
                    },
               function(){
                        self.destroy();
                        deferrable.reject('Could not get provider for the current user.');
                    });
            }, function () {
                if (offlineApp) {
                    $rootScope.currentUser = offlineService.getItem(previousUser);
                    $rootScope.$broadcast('event:user-credentialsLoaded', offlineService.getItem(previousUserInfo));
                    deferrable.resolve();
                }
                else{
                    self.destroy();
                    deferrable.reject('Could not get roles for the current user.');
                }
            });
            return deferrable.promise;
        };

        this.getLoginLocationUuid = function(){
            return $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName) ? $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid : null;
        };

        this.loadProviders = function(userInfo) {
            if (offlineApp) {
                var data  = offlineService.getItem('providerData');
                var providerUuid = (data.results.length > 0) ? data.results[0].uuid : undefined;
                $rootScope.currentProvider = { uuid: providerUuid };
                return $q.when(data);
            }
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
        }

    }]).directive('logOut',['sessionService', '$window', function(sessionService, $window) {
        return {
            link: function(scope, element) {
                element.bind('click', function() {
                    scope.$apply(function() {
                        sessionService.destroy().then(
                            function () {
                                $window.location = "../home/index.html#/login";
                            }
                        );
                    });
                });
            }
        };
    }])
    .directive('btnUserInfo', ['$rootScope', '$window', function() {
        return {
            restrict: 'CA',
            link: function(scope, elem) {
                elem.bind('click', function(event) {
                    $(this).next().toggleClass('active');
                    event.stopPropagation();
                });
                $(document).find('body').bind('click', function() {
                    $(elem).next().removeClass('active');
                });
            }
        };
    }
]);