'use strict';

angular.module('bahmni.home')
    .factory('initialization', ['$rootScope', 'appService', 'spinner', 'offlineService', '$bahmniCookieStore',
        function ($rootScope, appService, spinner, offlineService, $bahmniCookieStore) {
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
            return function () {
                return spinner.forPromise(initApp());
            }
        }
    ]);