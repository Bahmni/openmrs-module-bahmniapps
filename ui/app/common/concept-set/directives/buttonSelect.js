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
    .directive('buttonSelect', function () {
        return {
            restrict: 'E',
            scope: {
                observation: '=',
                abnormalObs: '=?'
            },

            link: function (scope, element, attrs) {
                if (attrs.dirtyCheckFlag) {
                    scope.hasDirtyFlag = true;
                }
            },
            controller: function ($scope) {
                $scope.isSet = function (answer) {
                    return $scope.observation.hasValueOf(answer);
                };

                $scope.select = function (answer) {
                    $scope.observation.toggleSelection(answer);
                    if ($scope.$parent.observation && typeof $scope.$parent.observation.onValueChanged == 'function') {
                        $scope.$parent.observation.onValueChanged();
                    }
                    $scope.$parent.handleUpdate();
                };

                $scope.getAnswerDisplayName = function (answer) {
                    var shortName = answer.names ? _.first(answer.names.filter(function (name) {
                        return name.conceptNameType === 'SHORT';
                    })) : null;
                    return shortName ? shortName.name : answer.displayString;
                };
            },
            templateUrl: '../common/concept-set/views/buttonSelect.html'
        };
    });
