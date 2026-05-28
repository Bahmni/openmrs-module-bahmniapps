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
    .filter('birthDateToAgeText', ['$filter', '$translate', function ($filter, $translate) {
        return function (birthDate) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            if (birthDate) {
                var age = DateUtil.diffInYearsMonthsDays(birthDate, DateUtil.now());
                var ageInString = "";
                if (age.years) {
                    ageInString += age.years + " " + $translate.instant("CLINICAL_YEARS_TRANSLATION_KEY") + " ";
                }
                if (age.months) {
                    ageInString += age.months + " " + $translate.instant("CLINICAL_MONTHS_TRANSLATION_KEY") + " ";
                }
                if (age.days) {
                    ageInString += age.days + " " + $translate.instant("CLINICAL_DAYS_TRANSLATION_KEY") + " ";
                }
                return ageInString;
            } else {
                return "";
            }
        };
    }])
    .filter('birthDateToYears', ['$filter', function ($filter) {
        return function (birthDate) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            if (birthDate) {
                var age = DateUtil.diffInYearsMonthsDays(birthDate, DateUtil.now());
                return age.years || 0;
            } else {
                return "";
            }
        };
    }]);
