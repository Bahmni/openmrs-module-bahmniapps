'use strict';

angular.module('bahmni.home')
    .factory('offlineDbInitialization', ['$rootScope', '$q', 'appService', 'spinner', 'offlineService', '$bahmniCookieStore','initializeOfflineSchema',
        function ($rootScope, $q, appService, spinner, offlineService, $bahmniCookieStore, initializeOfflineSchema) {
            var setPlatformCookie = function () {
                var platform = Bahmni.Common.Constants.platformType.chrome;
                if (window.navigator.userAgent.match(/Android/i)) {
                    platform = Bahmni.Common.Constants.platformType.android;
                }
                else if ($rootScope.loginDevice) {
                    platform = Bahmni.Common.Constants.platformType.chromeApp;
                }
                if (_.isEmpty(offlineService.getAppPlatform())){
                    $bahmniCookieStore.put(Bahmni.Common.Constants.platform, platform, {path: '/', expires: 365});
                }
            };

            var initApp = function () {
                setPlatformCookie();
                return appService.initApp('home');
            };

            $rootScope.offline = function() {
                return offlineService.offline();
            };

            $rootScope.isOfflineApp = function() {
                return offlineService.isOfflineApp();
            };

            return function() {
                return initializeOfflineSchema.initSchema().then(function(db){
                    return initApp().then(function(){
                        return db;
                    })
                });
            };
        }
    ])
    .factory('loginInitialization', ['$rootScope', '$q', 'locationService', 'spinner','messagingService',
        function ($rootScope, $q, locationService, spinner, messagingService) {
            var init = function () {

                var deferrable = $q.defer();
                locationService.getAllByTag("Login Location").then(
                    function(response) {deferrable.resolve({locations: response.data.results})},
                    function() {deferrable.reject(); messagingService.showMessage('error','Unable to fetch locations. Please reload the page.');}
                );
                return deferrable.promise;
            };

            return spinner.forPromise(init());
        }
    ]);