'use strict';

angular.module('bahmni.common.offline')
    .service('appInfoStrategy', function () {
        var getVersion = function () {
            return AppUpdateService.getVersion();
        };
        return {
            getVersion: getVersion
        };
    });
