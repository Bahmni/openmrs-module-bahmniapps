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
    .controller('PatientDashboardAllVisitsController', ['$scope', '$state', '$stateParams',
        function ($scope, $state, $stateParams) {
            $scope.patient = $scope.ngDialogData.patient;
            $scope.noOfVisits = $scope.ngDialogData.noOfVisits;
            var sectionConfig = $scope.ngDialogData.sectionConfig;

            var defaultParams = {
                maximumNoOfVisits: $scope.noOfVisits ? $scope.noOfVisits : 0
            };

            $scope.params = angular.extend(defaultParams, $scope.params);
            $scope.params = angular.extend(sectionConfig, $scope.params);
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.showAllObservationsData = true;
        }]);
