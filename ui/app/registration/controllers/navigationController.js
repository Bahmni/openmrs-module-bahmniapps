'use strict';

angular.module('bahmni.registration')
    .controller('NavigationController', ['$scope', '$rootScope', '$location', 'sessionService', '$window', 'appService',
        function ($scope, $rootScope, $location, sessionService, $window, appService) {

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
        };
    }]);
