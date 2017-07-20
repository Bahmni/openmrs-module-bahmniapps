'use strict';

angular.module('bahmni.common.offline')
    .service('appInfoStrategy', function () {
        var getVersion = function () {
            var manifest = chrome.app.getDetails();
            return manifest.version;
        };
        return {
            getVersion: getVersion
        };
    });
