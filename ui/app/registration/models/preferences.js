'use strict';

angular.module('bahmni.registration')
    .factory('preferences', [function () {
        return {
            hasOldIdentifier: false
        };
    }]);
