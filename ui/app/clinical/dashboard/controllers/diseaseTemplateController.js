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
    .controller('DiseaseTemplateController', ['$scope',
        function ($scope) {
            var patient = $scope.patient;
            $scope.showDateTimeForIntake = false;
            $scope.showTimeForProgress = true;
            $scope.dialogData = {
                "diseaseTemplateName": $scope.section.templateName,
                "patient": patient,
                "section": $scope.section
            };
            $scope.getDiseaseTemplateSection = function (diseaseName) {
                return _.find($scope.diseaseTemplates, function (diseaseTemplate) {
                    return diseaseTemplate.name === diseaseName;
                });
            };
        }]);
