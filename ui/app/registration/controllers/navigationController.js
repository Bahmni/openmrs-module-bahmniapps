'use strict';

angular.module('bahmni.registration')
    .controller('NavigationController', ['$scope', '$rootScope', '$location', 'sessionService', '$window', 'appService', '$sce','offlineService', 'WorkerService','scheduledSync',
        function ($scope, $rootScope, $location, sessionService, $window, appService, $sce, offlineService, WorkerService, scheduledSync) {
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

            $scope.sync = function() {
                if(offlineService.isChromeApp()){
                    if (Bahmni.Common.Offline && Bahmni.Common.Offline.BackgroundWorker) {
                        new Bahmni.Common.Offline.BackgroundWorker(WorkerService, offlineService, {delay: 1000, repeat: 1});
                    }
                }
                else{
                    scheduledSync(undefined, {delay: 1000, repeat: 1});
                }

            };

            $scope.$on("schedulerStage", function(event,stage){
                $scope.isSyncing = (stage !== null);
            });

        }]);
