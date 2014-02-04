'use strict';

angular.module('registration.navigation', ['authentication'])
    .controller('NavigationController', ['$scope', '$rootScope', '$location', 'sessionService', '$window', 'appService', 'initialization',function ($scope, $rootScope, $location, sessionService, $window, appService, initialization) {
        var loginPagePath = "/login";

        $rootScope.$on('event:appExtensions-loaded', function () {
            $scope.extensions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.navigation", "link");
        });

        $scope.goTo = function(url) {
            $location.url(url);
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
