/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.clinical').factory('visitHistoryInitialization',
    ['patientVisitHistoryService', 'sessionService', 'locationService',
        function (patientVisitHistoryService, sessionService, locationService) {
            return function (patientUuid) {
                var loginLocationUuid = sessionService.getLoginLocationUuid();
                return locationService.getVisitLocation(loginLocationUuid).then(function (response) {
                    var visitLocationUuid = response.data ? response.data.uuid : null;
                    return patientVisitHistoryService.getVisitHistory(patientUuid, visitLocationUuid);
                });
            };
        }
    ]
);
