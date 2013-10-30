'use strict';

angular.module('bahmnihome')
    .controller('LoginController', ['$rootScope', '$scope', '$window', '$location', 'sessionService', 'spinner', function ($rootScope, $scope, $window, $location, sessionService, spinner) {
        var landingPagePath = "/dashboard";
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
            $scope.errorMessage = null;
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

        $scope.logout = function() {
            $rootScope.errorMessage = null;
            sessionService.destroy().then(
                function() {
                    $location.url(loginPagePath);
                }
            );
        }

        $scope.onLoginPage = function() {
            return $location.path() === loginPagePath;
        }

        
    }]);
