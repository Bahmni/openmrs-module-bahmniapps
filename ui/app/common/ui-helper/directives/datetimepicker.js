/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.uiHelper')
    .directive('datetimepicker', function () {
        var link = function ($scope) {
            if (!$scope.allowFutureDates) {
                $scope.maxDate = Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime();
            }
            var getSelectedDateStr = function () {
                return $scope.selectedDate != null ? moment($scope.selectedDate).format("YYYY-MM-DD") : "";
            };

            var getSelectedTimeStr = function () {
                return $scope.selectedTime != null ? moment($scope.selectedTime).format("HH:mm") : "";
            };

            var valueNotFilled = function () {
                return $scope.selectedDate == null && $scope.selectedTime == null;
            };

            var valueCompletelyFilled = function () {
                return ($scope.selectedDate != null && $scope.selectedTime != null);
            };

            $scope.updateModel = function () {
                if (valueCompletelyFilled()) {
                    $scope.model = getSelectedDateStr() + " " + getSelectedTimeStr();
                } else if (!$scope.isValid()) {
                    $scope.model = "Invalid Datetime";
                } else {
                    $scope.model = "";
                }
            };

            $scope.isValid = function () {
                return valueNotFilled() || valueCompletelyFilled();
            };

            if ($scope.model) {
                var date = moment($scope.model).toDate();
                $scope.selectedDate = date;
                $scope.selectedTime = date;
                $scope.updateModel();
            }
        };

        return {
            restrict: 'E',
            link: link,
            scope: {
                model: '=',
                observation: "=",
                showTime: '=',
                illegalValue: '=',
                allowFutureDates: '='
            },
            template:
                "<div>" +
                    "<input type='date' ng-change='updateModel()' ng-class=\"{'illegalValue': illegalValue}\" ng-attr-max='{{maxDate || undefined}}' ng-model='selectedDate' ng-disabled='observation.disabled' />" +
                "</div>" +
                "<div>" +
                    "<input type='time' ng-change='updateModel()' ng-class= \"{'illegalValue': !isValid()}\" ng-model='selectedTime' ng-disabled='observation.disabled' />" +
                "</div>"
        };
    });
