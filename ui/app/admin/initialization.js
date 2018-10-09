'use strict';

angular.module('bahmni.admin')
.factory('initialization', ['$rootScope', '$q', 'appService', 'spinner',
    function ($rootScope, $q, appService, spinner) {
        var initApp = function () {
            return appService.initApp('admin');
        };

        var checkPrivilege = function () {
            return appService.checkPrivilege("app:admin");
        };

        return spinner.forPromise(initApp().then(checkPrivilege));
    }
]);
