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
    .directive('buttonsRadio', function () {
        return {
            restrict: 'E',
            scope: { model: '=', options: '=', dirtyCheckFlag: '=' },
            link: function (scope, element, attrs) {
                if (attrs.dirtyCheckFlag) {
                    scope.hasDirtyFlag = true;
                }
            },
            controller: function ($scope) {
                if (angular.isString($scope.options)) {
                    $scope.options = $scope.options.split(',').reduce(function (options, item) {
                        options[item] = item;
                        return options;
                    }, {});
                }
                $scope.activate = function (option) {
                    if ($scope.model === option) {
                        $scope.model = undefined;
                    } else {
                        $scope.model = option;
                    }
                    if ($scope.hasDirtyFlag) {
                        $scope.dirtyCheckFlag = true;
                    }
                };
            },
            template: "<button type='button' class='btn' " +
                "ng-class='{active: value === model}'" +
                "ng-repeat='(displayOption,value) in options' " +
                "ng-click='activate(value)'><span></span>{{displayOption | translate}} " +
                "</button>"
        };
    });
