/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.home')
    .factory('initialization', ['$rootScope', 'appService', 'spinner', 'configurationService',
        function ($rootScope, appService, spinner, configurationService) {
            var getConfigs = function () {
                configurationService.getConfigurations(['quickLogoutComboKey', 'contextCookieExpirationTimeInMinutes']).then(function (response) {
                    $rootScope.quickLogoutComboKey = response.quickLogoutComboKey || 'Escape';
                    $rootScope.cookieExpiryTime = response.contextCookieExpirationTimeInMinutes || 0;
                });
            };
            var initApp = function () {
                return appService.initApp('home');
            };
            return function () {
                return spinner.forPromise(initApp().then(getConfigs));
            };
        }
    ]);
