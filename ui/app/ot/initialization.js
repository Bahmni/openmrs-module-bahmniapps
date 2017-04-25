'use strict';

angular.module('bahmni.ot').factory('initialization', ['$rootScope', '$q', '$bahmniCookieStore', 'appService', 'configurations', 'authenticator', 'spinner', 'locationService',
    function ($rootScope, $q, $bahmniCookieStore, appService, configurations, authenticator, spinner, locationService) {
        var initApp = function () {
            return $q.when({});
        };

        return spinner.forPromise(authenticator.authenticateUser().then(initApp));
    }
]);
