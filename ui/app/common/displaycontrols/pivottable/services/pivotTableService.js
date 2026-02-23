/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.displaycontrol.pivottable')
    .service('pivotTableService', ['$http', function ($http) {
        this.getPivotTableFor = function (patientUuid, diseaseSummaryConfig, visitUuid, startDate, endDate) {
            return $http.get(Bahmni.Common.Constants.diseaseSummaryPivotUrl, {
                params: {
                    patientUuid: patientUuid,
                    visit: visitUuid,
                    numberOfVisits: diseaseSummaryConfig["numberOfVisits"],
                    initialCount: diseaseSummaryConfig["initialCount"],
                    latestCount: diseaseSummaryConfig["latestCount"],
                    obsConcepts: diseaseSummaryConfig["obsConcepts"],
                    drugConcepts: diseaseSummaryConfig["drugConcepts"],
                    labConcepts: diseaseSummaryConfig["labConcepts"],
                    groupBy: diseaseSummaryConfig["groupBy"],
                    startDate: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(startDate),
                    endDate: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(endDate)
                }
            });
        };
    }]);
