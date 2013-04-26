'use strict';

angular.module('registration.loginController', ['registration.sessionService'])
    .controller('LoginController', ['$rootScope', '$scope', '$http', '$location', 'sessionService', function ($rootScope, $scope, $http, $location, sessionService) {
        var landingPagePath = "/search";
        var loginPagePath = "/login";

        var redirectToLandingPageIfAlreadyAuthenticated = function() {
            sessionService.get().success(function (data) {
                if (data.authenticated) {
                    $location.path(landingPagePath);
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
                    $rootScope.$broadcast('event:auth-loggedin');
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
