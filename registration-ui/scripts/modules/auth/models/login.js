'use strict';

angular.module('registration.login', ['registration.sessionService'])
    .factory('login', ['$rootScope', '$q', '$location', 'sessionService', function ($rootScope, $q, $location, sessionService) {
        var defer = $q.defer();

        sessionService.get().success(function (data) {
            if (data.authenticated) {
                defer.resolve();
            } else {
              $location.path("/login");
            }
        });

        $rootScope.$on('event:auth-loggedin', function () {
            defer.resolve();
        })

        return defer.promise;
    }]);