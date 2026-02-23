/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.clinical')
    .directive('observationData', [ function () {
        var controller = function ($scope) {
            $scope.hasGroupMembers = function () {
                return $scope.observation.groupMembers && $scope.observation.groupMembers.length > 0;
            };
            $scope.getDisplayValue = function () {
                return $scope.observation.value ? ($scope.observation.value.display || $scope.observation.value) : (null);
            };
        };
        return {
            restrict: 'E',
            template: '<ng-include src="\'../clinical/displaycontrols/observationData/views/observationData.html\'" />',
            scope: {
                observation: "="
            },
            controller: controller
        };
    }]);
