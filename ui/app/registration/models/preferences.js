'use strict';

angular.module('bahmni.registration')
    .factory('Preferences', [function () {
        return {
            hasOldIdentifier: false
        };
    }]);
