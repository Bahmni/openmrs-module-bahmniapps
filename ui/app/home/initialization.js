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
                var platform = "chrome";
                if(window.navigator.userAgent.match(/Android/i)){
                    //if(navigator.platform.equals("Linux armv7l")){
                    platform = "android";
                }
                else if (window.chrome && chrome.runtime && chrome.runtime.id) {
                    platform = "chrome app"
                }
                $bahmniCookieStore.put(Bahmni.Common.Constants.platform, platform);
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