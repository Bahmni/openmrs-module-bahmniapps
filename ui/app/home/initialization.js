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
