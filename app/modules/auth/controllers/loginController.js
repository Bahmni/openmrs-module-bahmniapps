'use strict';

angular.module('bahmnihome')
    .controller('LoginController', ['$rootScope', '$scope', '$window', '$location', 'sessionService', 'spinner', function ($rootScope, $scope, $window, $location, sessionService, spinner) {
        var landingPagePath = "/dashboard";
        var loginPagePath = "/login";

        var redirectToLandingPageIfAlreadyAuthenticated = function() {
            sessionService.getSession().success(function (data) {
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
            var loginPromise = sessionService.loginUser($scope.username, $scope.password).then(
                function() {
                    $location.path(landingPagePath);
                    $rootScope.$broadcast('event:auth-loggedin');
                }, 
                function(error) {
                    $scope.errorMessage = error;
                }
            );
            spinner.forPromise(loginPromise);
        }

        $scope.logout = function() {
            $rootScope.errorMessage = null;
            sessionService.destroy().then(
                function() {
                    $rootScope.currentUser = null;
                    //$location.url(loginPagePath);
                    $window.location = "/home";
                }
            );
        }

        $scope.onLoginPage = function() {
            return $location.path() === loginPagePath;
        }

        
    }]);
