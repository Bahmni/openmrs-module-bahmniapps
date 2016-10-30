'use strict';

angular.module('bahmni.registration')
    .controller('NavigationController', ['$scope', '$rootScope', '$location', 'sessionService', '$window', 'appService', '$sce', 'offlineService', 'schedulerService',
        function ($scope, $rootScope, $location, sessionService, $window, appService, $sce, offlineService, schedulerService) {
            $scope.extensions = appService.getAppDescriptor().getExtensions("org.bahmni.registration.navigation", "link");
            $scope.isOfflineApp = offlineService.isOfflineApp();
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

            $scope.sync = function () {
                schedulerService.sync(Bahmni.Common.Constants.syncButtonConfiguration);
            };

            var cleanUpListenerSchedulerStage = $scope.$on("schedulerStage", function (event, stage, restartSync) {
                $scope.isSyncing = (stage !== null);
                if (restartSync) {
                    schedulerService.stopSync();
                    schedulerService.sync();
                }
            });

            $scope.$on("$destroy", cleanUpListenerSchedulerStage);
        }]);
