'use strict';

angular.module('bahmni.ot').factory('initialization', ['$rootScope', '$q', '$bahmniCookieStore', 'appService', 'configurations', 'authenticator', 'spinner',
    function ($rootScope, $q, $bahmniCookieStore, appService, configurations, authenticator, spinner) {
        var initApp = function () {
            return appService.initApp('ot', {'app': true, 'extension': true});
        };
        return spinner.forPromise(authenticator.authenticateUser().then(initApp));
    }
]);
