'use strict';

angular.module('bahmni.home')
    .controller('LoginController', ['$rootScope', '$scope', '$window', '$location', 'sessionService', 'spinner', '$q', '$routeParams',
     function ($rootScope, $scope, $window, $location, sessionService, spinner, $q, $routeParams) {
        var landingPagePath = "/dashboard";
        var loginPagePath = "/login";

        if($routeParams.showLoginMessage) {
            $scope.errorMessage = "You are not authenticated right now. Please login.";
        }

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
            var deferrable = $q.defer();
            sessionService.loginUser($scope.username, $scope.password).then(
                function() {
                    sessionService.loadCredentials().then(
                        function() {
                            $rootScope.$broadcast('event:auth-loggedin');
                            deferrable.resolve();
                        },
                        function(error) {
                            deferrable.reject(error);
                        }
                    )
                }, 
                function(error) {
                    $scope.errorMessage = error;
                    deferrable.reject(error);
                }
            );
            spinner.forPromise(deferrable.promise).then(
                function() {
                    $location.path(landingPagePath);
                }
            )
        }
        
    }]);
