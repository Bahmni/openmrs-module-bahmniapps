/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


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
