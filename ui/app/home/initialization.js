'use strict';

angular.module('bahmni.home').factory('initialization', ['$rootScope', '$q', 'appService', 'spinner',
    function ($rootScope, $q, appService, spinner) {
        var initApp = function () {
            return appService.initApp('home');
        };

        return spinner.forPromise(initApp());
    }
]);