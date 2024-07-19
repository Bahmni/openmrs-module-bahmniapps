'use strict';

angular.module('bahmni.reports').factory('initialization',
    ['$rootScope', 'authenticator', 'appService', 'spinner', 'configurations',
        function ($rootScope, authenticator, appService, spinner, configurations) {
            return function (appName) {
                var loadConfigPromise = function () {
                    var configNames = ['quickLogoutComboKey', 'contextCookieExpirationTimeInMinutes'];
                    return configurations.load(configNames).then(function () {
                        $rootScope.quickLogoutComboKey = configurations.quickLogoutComboKey() || 'Escape';
                        $rootScope.cookieExpiryTime = configurations.contextCookieExpirationTimeInMinutes() || 0;
                    });
                };
                var initApp = function () {
                    return appService.initApp(appName || 'reports', {'app': true, 'extension': true }, null, ["reports"]);
                };

                return spinner.forPromise(authenticator.authenticateUser()
                    .then(initApp)
                    .then(loadConfigPromise));
            };
        }
    ]
);
