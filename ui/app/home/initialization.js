'use strict';

angular.module('bahmni.home')
    .factory('offlineDbInitialization', ['$rootScope', '$q', 'appService', 'spinner', 'offlineService', '$bahmniCookieStore', 'initializeOfflineSchema',
        function ($rootScope, $q, appService, spinner, offlineService, $bahmniCookieStore, initializeOfflineSchema) {
            var setPlatformCookie = function () {
                var platform = Bahmni.Common.Constants.platformType.chrome;
                if (window.navigator.userAgent.match(/Android/i)) {
                    platform = Bahmni.Common.Constants.platformType.android;
                }
                else if ($rootScope.loginDevice) {
                    platform = Bahmni.Common.Constants.platformType.chromeApp;
                }
                if (_.isEmpty(offlineService.getAppPlatform())) {
                    $bahmniCookieStore.put(Bahmni.Common.Constants.platform, platform, {path: '/', expires: 365});
                }
            };

            var initApp = function () {
                setPlatformCookie();
                return appService.initApp('home');
            };

            $rootScope.offline = function () {
                return offlineService.offline();
            };

            $rootScope.isOfflineApp = function () {
                return offlineService.isOfflineApp();
            };

            return function () {
                return spinner.forPromise(initializeOfflineSchema.initSchema().then(function (db) {
                    return initApp().then(function () {
                        return db;
                    })
                }));
            };
        }
    ]);