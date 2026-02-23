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
    .controller('LatestPrescriptionPrintController', ['$scope', 'visitActionsService', 'messagingService',
        function ($scope, visitActionsService, messagingService) {
            var print = function (visitStartDate, visitUuid) {
                visitActionsService.printPrescription($scope.patient, visitStartDate, visitUuid, null);
                messagingService.showMessage("info", "CLOSE_TAB_MESSAGE");
            };

            if ($scope.visitHistory.activeVisit) {
                print($scope.visitHistory.activeVisit.startDatetime, $scope.visitHistory.activeVisit.uuid);
            } else {
                messagingService.showMessage("error", "NO_ACTIVE_VISIT_FOUND_MESSAGE");
            }
        }]);
