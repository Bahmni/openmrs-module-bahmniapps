/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.orders').factory('patientInitialization',
    ['$q', '$rootScope', 'patientService', 'configurations', '$translate',
        function ($q, $rootScope, patientService, configurations, $translate) {
            return function (patientUuid) {
                var getPatient = function () {
                    var patientMapper = new Bahmni.PatientMapper(configurations.patientConfig(), $rootScope, $translate);
                    return patientService.getPatient(patientUuid).then(function (openMRSPatientResponse) {
                        var patient = patientMapper.map(openMRSPatientResponse.data);
                        return {"patient": patient};
                    });
                };

                return getPatient();
            };
        }]
);
