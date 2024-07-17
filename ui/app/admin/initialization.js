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
