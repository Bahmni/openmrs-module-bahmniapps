'use strict';

angular.module('bahmni.common.util')
    .service('offlineStatusService', ['$rootScope', '$interval', 'appService', function ($rootScope, $interval, appService) {
        this.checkOfflineStatus = function () {
            if (Offline.state === 'up') {
                Offline.check();
            }
        };
        this.setOfflineOptions = function () {
            var networkConnectivity = appService.getAppDescriptor().getConfigValue("networkConnectivity");
            var showNetworkStatusIndicator = networkConnectivity != null ? networkConnectivity.showNetworkStatusMessage : null;
            var intervalFrequency = networkConnectivity != null ? networkConnectivity.networkStatusCheckInterval : null;
            intervalFrequency = intervalFrequency ? intervalFrequency : 5000;

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

            if (showNetworkStatusIndicator === false) {
                $('.offline-ui').css('display', 'none');
            }
        };
    }]);
