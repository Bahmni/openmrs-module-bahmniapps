'use strict';

angular.module('registration.navigation', [])
    .controller('NavigationController', ['$scope', '$rootScope', '$location', '$http', function ($scope, $rootScope, $location, $http) {
        var sessionResourcePath = $rootScope.BaseUrl + '/ws/rest/v1/session';
        var loginPagePath = "/login";

        $scope.createNew = function() {
            $location.search({});
            $location.path("/patient/new");
        };

        $scope.logout = function () {
            $rootScope.errorMessage = null;
            $http.delete(sessionResourcePath);
            $location.path(loginPagePath);
        }

        $scope.onLoginPage = function() {
            return $location.path() === loginPagePath;
        }
    }]);
