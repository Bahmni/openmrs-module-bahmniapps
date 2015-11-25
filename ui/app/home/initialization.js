'use strict';

angular.module('bahmni.home')
    .factory('dashboardInitialization', ['$rootScope', '$q', 'appService', 'spinner',
        function ($rootScope, $q, appService, spinner) {
            var initApp = function () {
                return appService.initApp('home');
            };

            return function() {
                return spinner.forPromise(initApp());
            };
        }
    ])
    .factory('loginInitialization', ['$rootScope', '$q', 'locationService', 'spinner','messagingService','$bahmniCookieStore',
        function ($rootScope, $q, locationService, spinner, messagingService, $bahmniCookieStore) {
            var init = function () {

                setPlatformCookie($bahmniCookieStore);

                $rootScope.getAppPlatform = function (){
                    return $bahmniCookieStore.get(Bahmni.Common.Constants.platform);
                };

                $rootScope.isOfflineApp = function (){
                    return $rootScope.getAppPlatform() !== Bahmni.Common.Constants.platformType.chrome;
                };

                var deferrable = $q.defer();
                locationService.getAllByTag("Login Location").then(
                    function(response) {deferrable.resolve({locations: response.data.results})},
                    function() {deferrable.reject(); messagingService.showMessage('error','Unable to fetch locations. Please reload the page.');}
                );
                return deferrable.promise;
            };

            var setPlatformCookie = function($bahmniCookieStore) {
                var platform = Bahmni.Common.Constants.platformType.chrome;
                if(window.navigator.userAgent.match(/Android/i)){
                    //if(navigator.platform.equals("Linux armv7l")){
                    platform = Bahmni.Common.Constants.platformType.android;
                }
                else if (window.chrome && chrome.runtime && chrome.runtime.id) {
                    platform = Bahmni.Common.Constants.platformType.chromeApp;
                }
                $bahmniCookieStore.put(Bahmni.Common.Constants.platform, platform, {path: '/', expires: 365});
            };

            return spinner.forPromise(init());
        }
    ]);