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
    .controller('PatientDashboardVisitsController', ['$scope', '$stateParams',
        function ($scope, $stateParams) {
            $scope.noOfVisits = $scope.visitHistory.visits.length;
            $scope.dialogData = {
                "noOfVisits": $scope.noOfVisits,
                "patient": $scope.patient,
                "sectionConfig": $scope.dashboard.getSectionByType("visits")
            };

            $scope.dashboardConfig = $scope.dashboard.getSectionByType("visits").dashboardConfig || {};
            $scope.patientUuid = $stateParams.patientUuid;
        }]);
