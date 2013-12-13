'use strict';

angular.module('authentication', ['ngCookies'])
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

            return function (promise) {
                return promise.then(success, error);
            }

        }];
        $httpProvider.responseInterceptors.push(interceptor);
    }).run(['$rootScope', '$window', function ($rootScope, $window) {
        $rootScope.$on('event:auth-loginRequired', function () {
            $rootScope.errorMessage = "You are not authenticated right now. Please login.";
            $window.location = "/home";
        });
    }]).service('sessionService', ['$rootScope', '$http', '$q', '$cookieStore', function ($rootScope, $http, $q, $cookieStore) {
        var sessionResourcePath = '/openmrs/ws/rest/v1/session';
        this.destroy = function () {
            return $http.delete(sessionResourcePath);
        };

        this.get = function () {
            return $http.get(sessionResourcePath, { cache: false });
        };

        this.loadCredentials = function () {
            var deferrable = $q.defer();
            var currentUser = $cookieStore.get('bahmni.user');
            $http.get("/openmrs/ws/rest/v1/user", {
                method: "GET",
                params: {
                    username: currentUser,
                    v: "custom:(username,uuid,privileges:(name,retired))"
                },
                cache: false
            }).success(function (data) {
                 $rootScope.currentUser = data.results[0];
                 $rootScope.$broadcast('event:user-credentialsLoaded', data.results[0]);
                 deferrable.resolve(data.results[0]);
            }).error(function () {
                 deferrable.reject('Could not get roles for the current user.');
            });
            return deferrable.promise;
        };

        var loadProviders = function(userInfo) {
            return $http.get("/openmrs/ws/rest/v1/provider", {
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

        $rootScope.$on('event:user-credentialsLoaded', function (event, userInfo) {
            loadProviders(userInfo);
        });        

    }]).factory('authenticator', ['$rootScope', '$q', '$window', 'sessionService', function ($rootScope, $q, $window, sessionService) {
        var authenticateUser = function () {
            var defer = $q.defer();
            sessionService.get().success(function (data) {
                if (data.authenticated) {
                    defer.resolve();
                } else {
                    defer.reject('User not authenticated');
                    $window.location = "/home";
                }
            });
            return defer.promise;
        }

        return {
            authenticateUser: authenticateUser
        }

    }]).directive('logOut',['sessionService', '$window', function(sessionService, $window) {
        return {
            link: function(scope, element, attrs) {
                element.bind('click', function() {
                    scope.$apply(function() {
                        sessionService.destroy().then(
                            function () {
                                $window.location = "/home/#/login";
                            }
                        );
                    });
                });
            }
        };
    }]);