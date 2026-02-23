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
    .directive('newOrderGroup', [function () {
        var controller = function ($scope) {
            $scope.config = {
                columns: ['drugName', 'dosage', 'frequency', 'route', 'duration', 'startDate', 'instructions'],
                actions: ['edit'],
                columnHeaders: {
                    frequency: 'MEDICATION_LABEL_FREQUENCY',
                    drugName: 'MEDICATION_DRUG_NAME_TITLE'
                }
            };
            var setOrderSetName = function (orderSetNewName) {
                if (!_.isUndefined(orderSetNewName)) {
                    $scope.config.title = orderSetNewName;
                }
            };
            $scope.$watch('orderSetName', setOrderSetName);
        };
        return {
            templateUrl: 'consultation/views/newOrderGroup.html',
            scope: {
                treatments: "=",
                orderSetName: "="
            },
            controller: controller
        };
    }]);
