'use strict';

angular.module('registration.loginController', ['registration.sessionService', 'infrastructure.spinner'])
    .controller('LoginController', ['$rootScope', '$scope', '$http', '$location', 'sessionService', 'spinner',function ($rootScope, $scope, $http, $location, sessionService, spinner) {
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
            var createSessionPromise = sessionService.create($scope.username, $scope.password).success(function (data) {
                if (data.authenticated) {
                    $location.path(landingPagePath);
                    $rootScope.$broadcast('event:auth-loggedin');
                } else {
                    $scope.errorMessage = "Authentication failed. Please try again."
                    $scope.resetForm();
                }
            });
            spinner.forPromise(createSessionPromise);
        }

        $scope.resetForm = function () {
            $scope.password = "";
        }
    }]);
