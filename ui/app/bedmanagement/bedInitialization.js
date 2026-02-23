/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.ipd').factory('bedInitialization', ['$rootScope', '$q', 'patientService', 'initialization', 'bedService', 'spinner',
    function ($rootScope, $q, patientService, initialization, bedService, spinner) {
        return function (bedId, patientUuid) {
            var initializeBedInfo = function () {
                if (bedId) {
                    return bedService.getCompleteBedDetailsByBedId(bedId).then(function (response) {
                        var bedInfo = response.data;
                        bedInfo.wardName = response.data.physicalLocation.parentLocation.display;
                        bedInfo.wardUuid = response.data.physicalLocation.parentLocation.uuid;
                        bedInfo.physicalLocationName = response.data.physicalLocation.name;
                        $rootScope.bedDetails = bedInfo;
                        return bedInfo;
                    });
                }
                return bedService.setBedDetailsForPatientOnRootScope(patientUuid);
            };
            return spinner.forPromise(initializeBedInfo());
        };
    }
]);

