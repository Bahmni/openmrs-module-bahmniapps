'use strict';

angular.module('registration.session', [])
    .controller('SessionController', ['$rootScope', '$scope', '$http', '$location', function ($rootScope, $scope, $http, $location) {
        var sessionResourcePath = $rootScope.BaseUrl + '/ws/rest/v1/session';
        var landingPagePath = "/search";
        $scope.isAuthenticated = true;

        var redirectToLandingPageIfAlreadyAuthenticated = function() {
            $http.get(sessionResourcePath, {
                cache: false,
            }).success(function (data) {
                if (data.authenticated) {
                    $location.path(landingPagePath);
                } else {
                    $scope.isAuthenticated = false;
                }
            });
        }

        if($location.path() == "/login") {
            redirectToLandingPageIfAlreadyAuthenticated();
        }

        $scope.login = function () {
            $scope.errorMessage = null
            return $http.get(sessionResourcePath, {
                headers: {'Authorization': 'Basic ' + window.btoa($scope.username + ':' + $scope.password)},
                cache: false
            }).success(function (data) {
                if (data.authenticated) {
                    $location.path(landingPagePath);
                } else {
                    $scope.errorMessage = "Authentication failed. Please try again."
                    $scope.resetForm();
                }
            });
        }

        $scope.logout = function () {
            $rootScope.errorMessage = null;
            $http.delete(sessionResourcePath);
            $location.path("/login");
        }

        $scope.resetForm = function () {
            $scope.password = "";
        }
    }]);
