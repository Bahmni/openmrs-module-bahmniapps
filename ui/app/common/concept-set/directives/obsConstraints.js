/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.conceptSet')
    .directive('obsConstraints', function () {
        var attributesMap = {'Numeric': 'number', 'Date': 'date', 'Datetime': 'datetime'};
        var link = function ($scope, element) {
            var attributes = {};
            var obsConcept = $scope.obs.concept;
            if (obsConcept.conceptClass == Bahmni.Common.Constants.conceptDetailsClassName) {
                obsConcept = $scope.obs.primaryObs.concept;
            }
            attributes['type'] = attributesMap[obsConcept.dataType] || "text";
            if (attributes['type'] === 'number') {
                attributes['step'] = 'any';
            }
            if (obsConcept.hiNormal) {
                attributes['max'] = obsConcept.hiNormal;
            }
            if (obsConcept.lowNormal) {
                attributes['min'] = obsConcept.lowNormal;
            }
            if (attributes['type'] == 'date') {
                if ($scope.obs.conceptUIConfig == null || !$scope.obs.conceptUIConfig['allowFutureDates']) {
                    attributes['max'] = Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime();
                }
            }
            element.attr(attributes);
        };

        return {
            link: link,
            scope: {
                obs: '='
            },
            require: 'ngModel'
        };
    });
