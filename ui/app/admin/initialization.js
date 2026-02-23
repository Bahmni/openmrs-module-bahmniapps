/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.admin')
.factory('initialization', ['$rootScope', '$q', 'appService', 'spinner', 'configurations',
    function ($rootScope, $q, appService, spinner, configurations) {
        var loadConfigPromise = function () {
            var configNames = ['quickLogoutComboKey', 'contextCookieExpirationTimeInMinutes'];
            return configurations.load(configNames).then(function () {
                $rootScope.quickLogoutComboKey = configurations.quickLogoutComboKey() || 'Escape';
                $rootScope.cookieExpiryTime = configurations.contextCookieExpirationTimeInMinutes() || 0;
            });
        };

        var initApp = function () {
            return appService.initApp('admin');
        };

        var checkPrivilege = function () {
            return appService.checkPrivilege("app:admin");
        };

        return spinner.forPromise(initApp().then(checkPrivilege).then(loadConfigPromise));
    }
]);
