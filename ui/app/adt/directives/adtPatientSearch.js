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
    .directive('adtPatientSearch', ['$timeout', function ($timeout) {
        var link = function ($scope, element) {
            $timeout(function () {
                element.find('.tabs ul').prepend($('.ward-list-tab'));
                element.find('.tab-content').prepend($('#ward-list'));
                if ($scope.isBedManagementEnabled && !$scope.search.navigated) {
                    $scope.search.searchType = undefined;
                }
            });
        };

        return {
            restrict: 'E',
            controller: 'PatientsListController',
            link: link,
            templateUrl: '../common/patient-search/views/patientsList.html'
        };
    }]);
