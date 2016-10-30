'use strict';

angular.module('bahmni.common.patient')
.filter('age', function () {
    return function (age) {
        if (age.years) {
            return age.years + " y";
        }
        if (age.months) {
            return age.months + " m";
        }
        return age.days + " d";
    };
});
