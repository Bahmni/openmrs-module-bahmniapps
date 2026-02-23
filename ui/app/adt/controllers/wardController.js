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
    .controller('WardController', ['$scope', '$rootScope', '$window', 'spinner', 'wardService', 'bedManagementService', 'userService',
        function ($scope, $rootScope, $window, spinner, wardService, bedManagementService, userService) {
            var init = function () {
                if ($scope.readOnly) {
                    $scope.expanded = $rootScope.currentUser.isFavouriteWard($scope.ward.ward.name);
                    $scope.showWardList();
                } else {
                    $scope.expanded = ($rootScope.bedDetails && $rootScope.bedDetails.wardUuid === $scope.ward.ward.uuid);
                    $scope.showWardLayout();
                }
            };

            $scope.toggleExpandState = function () {
                $scope.expanded = !$scope.expanded;
                if (!$scope.expanded) {
                    $scope.showWardList();
                }
                if ($scope.readOnly) {
                    $rootScope.currentUser.toggleFavoriteWard($scope.ward.ward.name);
                    userService.savePreferences();
                }
            };

            $scope.toggleWardView = function () {
                if ($scope.currentView === 'wardLayout') {
                    $scope.showWardList();
                } else {
                    $scope.showWardLayout();
                }
                expandView();
            };

            $scope.showWardLayout = function () {
                $scope.currentView = "wardLayout";
            };

            $scope.showWardList = function () {
                $scope.currentView = "wardList";
            };

            var expandView = function () {
                if (!$scope.expanded) {
                    $scope.toggleExpandState();
                }
            };

            init();
        }]);
