'use strict';

angular.module('bahmni.common.offline').service('networkStatusService', ['$window', function ($window) {
    var isOnline = function () {
        return $window.navigator.onLine;
    };

    return {
        isOnline: isOnline
    };
}]);
