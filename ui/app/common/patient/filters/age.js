'use strict';

angular.module('bahmni.common.patient')
.filter('age', function () {
    return function (age) {
        if (age.years) {
            return age.years + " year" + (age.years > 1 ? "s" : "");
        }
        if (age.months) {
            return age.months + " month" + (age.months > 1 ? "s" : "");
        }
        return age.days + " day" + (age.days > 1 ? "s" : "");
    };
});
