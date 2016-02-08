'use strict';

angular.module('bahmni.home')
    .factory('initialization', ['$rootScope', 'appService', 'spinner', 'offlineService', '$bahmniCookieStore',
        function ($rootScope, appService, spinner, offlineService, $bahmniCookieStore) {
            var initApp = function () {
                return appService.initApp('home');
            };
            return function () {
                return spinner.forPromise(initApp());
            }
        }
    ]);