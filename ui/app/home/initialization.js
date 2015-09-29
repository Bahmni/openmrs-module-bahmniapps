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