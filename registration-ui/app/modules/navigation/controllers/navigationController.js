'use strict';

angular.module('registration.navigation', ['authentication'])
    .controller('NavigationController', ['$scope', '$rootScope', '$location', 'sessionService', '$window', function ($scope, $rootScope, $location, sessionService, $window) {
        var loginPagePath = "/login";

        $scope.createNew = function() {
            $location.url("/patient/new");
        };

        $scope.logout = function () {
            $rootScope.errorMessage = null;
            sessionService.destroy().then(
                function() {
                    $window.location = "/home";
                }
            );
        }
        
    }]);
