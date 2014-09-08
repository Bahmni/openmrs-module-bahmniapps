'use strict';

angular.module('bahmni.home')
    .controller('LoginController', ['$rootScope', '$scope', '$window', '$location', 'sessionService', 'initialData', 'spinner', '$q', '$stateParams',
     function ($rootScope, $scope, $window, $location, sessionService, initialData, spinner, $q, $stateParams) {
        var landingPagePath = "/dashboard";
        var loginPagePath = "/login";
        $scope.locations = initialData.locations;
        $scope.loginInfo = {};

        if($stateParams.showLoginMessage) {
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
            sessionService.loginUser($scope.loginInfo.username, $scope.loginInfo.password, $scope.loginInfo.currentLocation).then(
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
