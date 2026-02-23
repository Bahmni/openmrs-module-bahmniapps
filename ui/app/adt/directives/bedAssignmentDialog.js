/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.adt')
    .directive('bedAssignmentDialog', function () {
        return {
            restrict: 'A',
            link: function (scope, elem) {
                elem.bind('click', function (e) {
                    scope.setBedDetails(scope.cell);
                    var leftPos = $(elem).offset().left - 132;
                    var topPos = $(elem).offset().top;
                    var bedInfoElem = $(elem).closest('.ward').find(".bed-info");
                    bedInfoElem.css('left', leftPos);
                    bedInfoElem.css('top', topPos);
                    e.stopPropagation();
                });
            }
        };
    });
