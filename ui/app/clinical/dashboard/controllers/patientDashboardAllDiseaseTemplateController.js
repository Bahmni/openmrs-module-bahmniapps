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
    .controller('PatientDashboardAllDiseaseTemplateController', ['$scope', 'diseaseTemplateService', 'spinner', 'appService', '$stateParams',
        function ($scope, diseaseTemplateService, spinner, appService, $stateParams) {
            var init = function () {
                $scope.diseaseName = $scope.ngDialogData.diseaseTemplateName;
                $scope.patient = $scope.ngDialogData.patient;
                $scope.section = $scope.ngDialogData.section;
                $scope.showDateTimeForIntake = true;
                $scope.showTimeForProgress = true;

                var programConfig = appService.getAppDescriptor().getConfigValue('program');
                var startDate = null, endDate = null;
                if (programConfig && programConfig.showDetailsWithinDateRange) {
                    startDate = $stateParams.dateEnrolled;
                    endDate = $stateParams.dateCompleted;
                }

                return diseaseTemplateService.getAllDiseaseTemplateObs($scope.patient.uuid, $scope.diseaseName, startDate, endDate).then(function (diseaseTemplate) {
                    $scope.diseaseTemplate = diseaseTemplate;
                });
            };

            spinner.forPromise(init());
        }]);
