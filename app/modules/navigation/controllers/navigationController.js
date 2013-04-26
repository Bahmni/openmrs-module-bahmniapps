'use strict';

angular.module('registration.navigation', ['registration.sessionService'])
    .controller('NavigationController', ['$scope', '$rootScope', '$location', 'sessionService', function ($scope, $rootScope, $location, sessionService) {
        var loginPagePath = "/login";

        $scope.createNew = function() {
            $location.search({});
            $location.path("/patient/new");
        };

        $scope.logout = function () {
            $rootScope.errorMessage = null;
            sessionService.destroy();
            $location.path(loginPagePath);
        }

        $scope.onLoginPage = function() {
            return $location.path() === loginPagePath;
        }
    }]);
