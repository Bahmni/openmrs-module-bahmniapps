'use strict';

angular.module('registration.loginController', ['registration.sessionService'])
    .controller('LoginController', ['$rootScope', '$scope', '$http', '$location', 'sessionService', function ($rootScope, $scope, $http, $location, sessionService) {
        var landingPagePath = "/search";
        var loginPagePath = "/login";
        $scope.isAuthenticated = true;

        var redirectToLandingPageIfAlreadyAuthenticated = function() {
            sessionService.get().success(function (data) {
                if (data.authenticated) {
                    $location.path(landingPagePath);
                } else {
                    $scope.isAuthenticated = false;
                }
            });
        }

        if($location.path() === loginPagePath) {
            redirectToLandingPageIfAlreadyAuthenticated();
        }

        $scope.login = function () {
            $scope.errorMessage = null
            return sessionService.create($scope.username, $scope.password).success(function (data) {
                if (data.authenticated) {
                    $location.path(landingPagePath);
                } else {
                    $scope.errorMessage = "Authentication failed. Please try again."
                    $scope.resetForm();
                }
            });
        }

        $scope.resetForm = function () {
            $scope.password = "";
        }
    }]);
