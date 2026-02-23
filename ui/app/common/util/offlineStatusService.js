/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


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
