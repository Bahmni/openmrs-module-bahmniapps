'use strict';

angular.module('bahmni.dhis')
.factory('initialization', ['$rootScope', '$q', 'appService', 'spinner',
    function ($rootScope, $q, appService, spinner) {
        var initApp = function () {
            return appService.initApp('dhis');
        };

        return spinner.forPromise(initApp());
    }
]);