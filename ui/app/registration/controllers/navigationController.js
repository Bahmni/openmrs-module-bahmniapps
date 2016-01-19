'use strict';

angular.module('bahmni.registration')
    .controller('NavigationController', ['$scope', '$rootScope', '$location', 'sessionService', '$window', 'appService', '$sce', 'offlineService',
        function ($scope, $rootScope, $location, sessionService, $window, appService, $sce, offlineService) {

            $scope.extensions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.navigation", "link");

            $scope.goTo = function (url) {
                $location.url(url);
            };

            $scope.htmlLabel = function (label) {
                return $sce.trustAsHtml(label);
            };

            $scope.logout = function () {
                $rootScope.errorMessage = null;
                sessionService.destroy().then(
                    function () {
                        $window.location = "../home/";
                    }
                );
            };

            $rootScope.$on('offline', function () {
                $scope.$apply();
            });

            $scope.isOffline = function () {
                return offlineService.offline();
            };
        }]);
