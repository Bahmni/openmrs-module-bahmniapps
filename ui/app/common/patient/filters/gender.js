'use strict';

angular.module('bahmni.common.patient')
.filter('gender', ['$rootScope', function ($rootScope) {
    return function (genderChar) {
        if (genderChar == null) {
            return "Unknown";
        }
        return $rootScope.genderMap[angular.uppercase(genderChar)];
    };
}]);
