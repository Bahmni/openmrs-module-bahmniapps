/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.common.uiHelper').directive('dateConverter', [function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelController) {
            var DateUtil = Bahmni.Common.Util.DateUtil;
            ngModelController.$parsers.push(function (date) {
                return DateUtil.parse(date);
            });

            ngModelController.$formatters.push(function (date) {
                return DateUtil.parse(DateUtil.getDateWithoutTime(date));
            });
        }
    };
}]);
