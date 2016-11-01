'use strict';

angular.module('bahmni.common.displaycontrol.patientprofile')
.filter('booleanFilter', function () {
    return function (value) {
        if (value === true) {
            return "Yes";
        } else if (value === false) {
            return "No";
        }
        return value;
    };
});
