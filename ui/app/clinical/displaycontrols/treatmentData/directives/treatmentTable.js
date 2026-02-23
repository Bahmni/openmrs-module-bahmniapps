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
    .directive('treatmentTable', function () {
        var controller = function ($scope, $rootScope) {
            $scope.isOtherActiveSection = function (dateString) {
                return dateString === Bahmni.Clinical.Constants.otherActiveDrugOrders;
            };

            $scope.isDataPresent = function () {
                if ($scope.drugOrderSections && $scope.drugOrderSections.length == 0) {
                    return $scope.$emit("no-data-present-event") && false;
                }
                return true;
            };

            $scope.downloadPrescription = function (visitStartDate, visitUuid) {
                $rootScope.$broadcast("event:downloadPrescriptionFromDashboard", visitStartDate, visitUuid);
            };
            $scope.sharePrescriptions = function (visitStartDate, visitUuid) {
                $rootScope.$broadcast("event:sharePrescriptionsViaEmail", visitStartDate, visitUuid);
            };
        };

        return {
            templateUrl: "displaycontrols/treatmentData/views/treatmentTable.html",
            scope: {
                drugOrderSections: "=",
                params: "="
            },
            controller: controller
        };
    });
