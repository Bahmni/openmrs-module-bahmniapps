'use strict';

angular.module('bahmnihome')
    .controller('LoginController', ['$rootScope', '$scope', '$window', '$location', 'sessionService', 'spinner', '$q',
     function ($rootScope, $scope, $window, $location, sessionService, spinner, $q) {
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
