'use strict';

angular.module('bahmni.common.util')
    .service('offlineStatusService', ['$rootScope', '$interval', 'appService', function ($rootScope, $interval, appService) {
        this.checkOfflineStatus = function () {
            if (Offline.state === 'up') {
                Offline.check();
            }
        };
        this.setOfflineOptions = function () {
            var showNetworkStatusIndicator = appService.getAppDescriptor().getConfigValue("showNetworkStatusMessage");
            var intervalFrequency = appService.getAppDescriptor().getConfigValue("networkStatusCheckInterval");
            intervalFrequency = intervalFrequency ? intervalFrequency : 5000;
            if (showNetworkStatusIndicator === true) {
                Offline.options = {
                    game: true,
                    checkOnLoad: true,
                    checks: {xhr: {url: Bahmni.Common.Constants.faviconUrl}}
                };

                this.checkOfflineStatus();
                if ($rootScope.offlineStatusCheckIntervalPromise === undefined) {
                    $rootScope.offlineStatusCheckIntervalPromise = $interval(this.checkOfflineStatus, intervalFrequency);
                }

                var clearCheckOfflineStatusInterval = function (offlineStatusCheckIntervalPromise) {
                    $interval.cancel(offlineStatusCheckIntervalPromise);
                };

                $rootScope.$on("$destroy", function () {
                    clearCheckOfflineStatusInterval($rootScope.offlineStatusCheckIntervalPromise);
                });
            }

        };
    }]);
