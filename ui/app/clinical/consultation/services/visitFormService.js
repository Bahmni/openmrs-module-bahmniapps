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
    .service('visitFormService', ['$http', function ($http) {
        var formData = function (patientUuid, numberOfVisits, formGroup, patientProgramUuid) {
            var params = {
                s: "byPatientUuid",
                patient: patientUuid,
                numberOfVisits: numberOfVisits,
                v: "visitFormDetails",
                conceptNames: formGroup || null,
                patientProgramUuid: patientProgramUuid
            };
            return $http.get(Bahmni.Common.Constants.formDataUrl, {params: params});
        };

        return {
            formData: formData
        };
    }]);
