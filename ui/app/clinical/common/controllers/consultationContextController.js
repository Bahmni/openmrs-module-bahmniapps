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
    .controller('consultationContextController', ['$scope', 'appService', '$stateParams', 'visitHistory',
        function ($scope, appService, $stateParams, visitHistory) {
            var init = function () {
                $scope.configName = $stateParams.configName;
                var programConfig = appService.getAppDescriptor().getConfigValue('program');
                $scope.visitUuid = _.get(visitHistory, 'activeVisit.uuid');
                $scope.patientInfoSection = {
                    "patientInformation": {
                        "title": "Patient Information",
                        "name": "patientInformation",
                        "patientAttributes": [],
                        "ageLimit": programConfig ? programConfig.patientInformation ? programConfig.patientInformation.ageLimit : undefined : undefined,
                        "addressFields": [
                            "address1",
                            "address2",
                            "cityVillage",
                            "countyDistrict"
                        ]
                    }
                };
            };
            init();
        }]);
