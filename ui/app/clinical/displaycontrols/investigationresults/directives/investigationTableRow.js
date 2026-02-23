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
    .directive('investigationTableRow', function () {
        var controller = function ($scope) {
            var urlFrom = function (fileName) {
                    return Bahmni.Common.Constants.labResultUploadedFileNameUrl + fileName;
                }, defaultParams = {
                    showDetailsButton: true
                };
            $scope.params = angular.extend(defaultParams, $scope.params);

            $scope.hasNotes = function () {
                return $scope.test.notes || $scope.test.showNotes ? true : false;
            };
            $scope.getFormattedRange = function (test) {
                if (test.minNormal && test.maxNormal) {
                    return "(" + test.minNormal + " - " + test.maxNormal + ")";
                } else if (test.minNormal && !test.maxNormal) {
                    return "(>" + test.minNormal + ")";
                } else if (!test.minNormal && test.maxNormal) {
                    return "(<" + test.maxNormal + ")";
                } else {
                    return "";
                }
            };
            $scope.getLocaleSpecificNameForPanel = function (test) {
                if ($scope.test.preferredPanelName != null) {
                    return test.preferredPanelName;
                } else {
                    if (!test.panelName) {
                        return test.orderName;
                    } else {
                        return test.panelName;
                    }
                }
            };
            $scope.getLocaleSpecificNameForTest = function (test) {
                if ($scope.test.preferredTestName != null) {
                    return test.preferredTestName;
                } else {
                    return test.testName;
                }
            };
            $scope.showTestNotes = function () {
                return $scope.hasNotes($scope.test);
            };

            $scope.test.showNotes = $scope.hasNotes();
            $scope.test.showDetailsButton = $scope.params.showDetailsButton;
            $scope.test.labReportUrl = $scope.test.uploadedFileName ? urlFrom($scope.test.uploadedFileName) : null;

            $scope.toggle = function () {
                $scope.test.showDetails = !$scope.test.showDetails;
            };

            $scope.isValidResultToShow = function (result) {
                if (result != undefined && result != null && result.toLowerCase(result) != 'undefined' && result.toLowerCase(result) != 'null') {
                    return true;
                }
                return false;
            };
        };
        return {
            restrict: 'A',
            controller: controller,
            scope: {
                test: "=",
                params: "="
            },
            templateUrl: "displaycontrols/investigationresults/views/investigationTableRow.html"
        };
    });
