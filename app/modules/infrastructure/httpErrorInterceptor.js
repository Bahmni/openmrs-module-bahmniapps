'use strict';

angular.module('infrastructure.httpErrorInterceptor', [])
    .config(function($httpProvider) {
        var interceptor = ['$rootScope', '$q', '$window', function($rootScope, $q, $window) {
            function stringAfter(value, searchString) {
                var indexOfFirstColon = value.indexOf(searchString);
                return value.substr(indexOfFirstColon + 1).trim()
            }

           function success(response) {
                return response;
           }

           function error(response) {
                if (response.status === 500) {
                    var data = response.data;
                    $rootScope.server_error = data.error ? stringAfter(data.error.message, ':') : "There was an unexpected issue. Please try again";
                    $window.scrollTo(0, 0)
                }
                return $q.reject(response);
            }

           return function(promise) {
                return promise.then(success, error);
           }

        }];
        $httpProvider.responseInterceptors.push(interceptor);
    });