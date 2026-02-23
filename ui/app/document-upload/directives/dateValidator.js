/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('opd.documentupload')
    .directive('dateValidator', function () {
        var DateUtil = Bahmni.Common.Util.DateUtil;

        var isVisitDateFromFuture = function (visitDate) {
            if (!visitDate.startDatetime && !visitDate.stopDatetime) {
                return false;
            }
            return (DateUtil.getDate(visitDate.startDatetime) > new Date() || (DateUtil.getDate(visitDate.stopDatetime) > new Date()));
        };

        var isStartDateBeforeEndDate = function (visitDate) {
            if (!visitDate.startDatetime || !visitDate.stopDatetime) {
                return true;
            }
            return (DateUtil.getDate(visitDate.startDatetime) <= DateUtil.getDate(visitDate.stopDatetime));
        };

        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                function validate () {
                    ngModel.$setValidity("overlap", scope.isNewVisitDateValid());
                    ngModel.$setValidity("future", !isVisitDateFromFuture(scope.newVisit));
                    ngModel.$setValidity("dateSequence", isStartDateBeforeEndDate(scope.newVisit));
                }
                scope.$watch(attrs.ngModel, validate);
                scope.$watch(attrs.dependentModel, validate);
            }
        };
    });
