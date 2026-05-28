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
.filter('dateToAge', ['$filter', function ($filter) {
    return function (birthDate, referenceDate) {
        var DateUtil = Bahmni.Common.Util.DateUtil;
        referenceDate = referenceDate || DateUtil.now();
        var age = DateUtil.diffInYearsMonthsDays(birthDate, referenceDate);
        return $filter('age')(age);
    };
}]);
