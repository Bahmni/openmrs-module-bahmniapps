/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.common.displaycontrol.hint')
    .directive('hint', [
        function () {
            var link = function ($scope) {
                $scope.hintForNumericConcept = Bahmni.Common.Domain.Helper.getHintForNumericConcept($scope.conceptDetails);
            };

            return {
                restrict: 'E',
                link: link,
                template: '<small class="hint" ng-if="::hintForNumericConcept">{{::hintForNumericConcept}}</small>',
                scope: {
                    conceptDetails: "="
                }
            };
        }]);
