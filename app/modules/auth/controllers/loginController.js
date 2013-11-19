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
            spinner.show();
            var loginPromise = sessionService.loginUser($scope.username, $scope.password).then(
                function() {
                    spinner.hide();
                    $location.path(landingPagePath);
                    $rootScope.$broadcast('event:auth-loggedin');
                }, 
                function(error) {
                    $scope.errorMessage = error;
                    spinner.hide();
                }
            );
            spinner.forPromise(loginPromise);
        }
        
    }]);
