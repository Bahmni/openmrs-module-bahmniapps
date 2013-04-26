'use strict';

angular.module('registration.login', ['registration.sessionService'])
    .factory('login', ['$rootScope', '$q','sessionService', function ($rootScope, $q, sessionService) {
        var defer = $q.defer();

        sessionService.get().success(function (data) {
            if (data.authenticated) {
                defer.resolve();
            }
        });

        $rootScope.$on('event:auth-loggedin', function () {
            defer.resolve();
        })

        return defer.promise;
    }]);