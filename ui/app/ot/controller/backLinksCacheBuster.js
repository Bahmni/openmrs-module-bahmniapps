/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

"use strict";

angular.module('bahmni.ot')
    .directive('backLinksCacheBuster', ['$state', '$window', function ($state, $window) {
        var controller = function ($scope, $state, $window) {
            $scope.navigationLinks = $state.current.data.navigationLinks;
            $scope.homeBackLink = $state.current.data.homeBackLink;
            $scope.isCurrentState = function (link) {
                if ($state.current.name === link.value) {
                    return true;
                }
            };
            $scope.linkAction = function (type, value, params) {
                if (type === 'state') {
                    onClickState(value, params);
                } else {
                    $window.location.href = value;
                }
            };

            var onClickState = function (value, params) {
                if (!params) {
                    params = {};
                }
                params['dashboardCachebuster'] = Math.random();
                $state.go(value, params);
            };
        };

        return {
            restrict: 'E',
            controller: controller,
            templateUrl: "views/backLinks.html",
            scope: {
                type: "=",
                name: "=",
                value: "=",
                params: "=",
                icon: "=",
                accessKey: "="
            }
        };
    }]);
