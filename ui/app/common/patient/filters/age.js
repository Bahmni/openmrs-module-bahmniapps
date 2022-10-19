'use strict';

angular.module('bahmni.common.patient')
.filter('age', ['$filter', '$translate', function ($filter, $translate) {
    return function (age) {
        var requiredAgeToShowCompletedYears = 5;
        if (age.years) {
            if (age.years < requiredAgeToShowCompletedYears) {
                return (age.years ? age.years + " " + $translate.instant("CLINICAL_YEARS_TRANSLATION_KEY") : "") +
                       (age.months ? " " + age.months + " " + $translate.instant("CLINICAL_MONTHS_TRANSLATION_KEY") : "");
            }
            return age.years + " " + $translate.instant("CLINICAL_YEARS_TRANSLATION_KEY");
        }
        if (age.months) {
            return age.months + " " + $translate.instant("CLINICAL_MONTHS_TRANSLATION_KEY");
        }
        return age.days + " " + $translate.instant("CLINICAL_DAYS_TRANSLATION_KEY");
    };
}]);
