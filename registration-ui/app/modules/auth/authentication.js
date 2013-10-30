// Inspired by code from https://github.com/witoldsz/angular-http-auth

'use strict';

angular.module('authentication', [])
    .config(function($httpProvider) {
        var interceptor = ['$rootScope', '$q', function($rootScope, $q) {
            function success(response) {
                return response;
            }

            function error(response) {
                if (response.status === 401) {
                    $rootScope.$broadcast('event:auth-loginRequired');
                }
                return $q.reject(response);
            }

            return function(promise) {
                return promise.then(success, error);
            }

        }];
        $httpProvider.responseInterceptors.push(interceptor);
    }).run(['$rootScope', '$window', function ($rootScope, $window) {
        $rootScope.$on('event:auth-loginRequired', function () {
            $rootScope.errorMessage = "You are not authenticated right now. Please login."
            $window.location = "/home";
        })
    }]).service('sessionService', ['$rootScope', '$http', function ($rootScope, $http) {
        var sessionResourcePath = constants.openmrsUrl + '/ws/rest/v1/session';

        var destroy = function(){
            return $http.delete(sessionResourcePath);
        }

        var get = function(){
            return $http.get(sessionResourcePath, { cache: false });
        }

        return {
            get: get,
            destroy: destroy
        }
    }]).factory('authenticator', ['$rootScope', '$q', '$window', 'sessionService', function ($rootScope, $q, $window, sessionService) {
        var authenticateUser = function() {
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
        
    }]);