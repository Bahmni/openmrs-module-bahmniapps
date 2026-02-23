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
    .service('patientVisitHistoryService', ['visitService', function (visitService) {
        this.getVisitHistory = function (patientUuid, currentVisitLocation) {
            return visitService.search({patient: patientUuid, v: 'custom:(uuid,visitType,startDatetime,stopDatetime,location,encounters:(uuid))', includeInactive: true})
                .then(function (data) {
                    var visits = _.map(data.data.results, function (visitData) {
                        return new Bahmni.Clinical.VisitHistoryEntry(visitData);
                    });
                    var activeVisit = visits.filter(function (visit) {
                        return visit.isActive() && visit.isFromCurrentLocation(currentVisitLocation);
                    })[0];

                    return {"visits": visits, "activeVisit": activeVisit};
                });
        };
    }]);
