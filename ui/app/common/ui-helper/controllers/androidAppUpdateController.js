'use strict';
angular.module('bahmni.common.uiHelper')
    .controller('AppUpdateController', ['$scope', 'ngDialog', 'offlineService', 'appInfoStrategy',
        function ($scope, ngDialog, offlineService, appInfoStrategy) {
            $scope.isAndroid = true;
            
            $scope.isUpdateAvailable = function () {
                var installedVersion = appInfoStrategy.getVersion();
                var appUpdateInfo = offlineService.getItem("appUpdateInfo");
                return appUpdateInfo && (installedVersion < appUpdateInfo.latestVersion);
            };
            
            $scope.update = function (url) {
                if (!url) {
                    url = offlineService.getItem("appUpdateInfo").latestAndroidAppUrl;
                }
                AppUpdateService.updateApp(url);
                ngDialog.close();
            }
        }]);
