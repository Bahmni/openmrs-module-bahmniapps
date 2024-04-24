'use strict';

angular.module('bahmni.home')
    .factory('initialization', ['$rootScope', 'appService', 'spinner', 'configurationService',
        function ($rootScope, appService, spinner, configurationService) {
            var getConfigs = function () {
                configurationService.getConfigurations(['quickLogoutComboKey']).then(function (response) {
                    $rootScope.quickLogoutComboKey = response.quickLogoutComboKey || 'Escape';
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
