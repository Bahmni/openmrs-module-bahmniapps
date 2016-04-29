'use strict';

angular.module('bahmni.registration')
    .controller('NavigationController', ['$scope', '$rootScope', '$location', 'sessionService', '$window', 'appService', '$sce','offlineService', 'offlinePatientSyncService',
        function ($scope, $rootScope, $location, sessionService, $window, appService, $sce, offlineService, offlinePatientSyncService) {
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
                offlinePatientSyncService.sync(Bahmni.Common.Constants.syncButtonConfiguration);

            };

            $scope.$on("schedulerStage", function(event,stage){
                $scope.isSyncing = (stage !== null);
            });

        }]);
