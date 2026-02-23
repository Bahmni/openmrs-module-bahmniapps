/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

angular.module('bahmni.common.bacteriologyresults')
    .factory('bacteriologyResultsService', ['$http', function ($http) {
        var getBacteriologyResults = function (data) {
            var params = {
                patientUuid: data.patientUuid,
                name: "BACTERIOLOGY CONCEPT SET",
                v: "full"
            };
            if (data.patientProgramUuid) {
                params = {
                    patientProgramUuid: data.patientProgramUuid,
                    s: "byPatientProgram",
                    v: "full"
                };
            }
            return $http.get(Bahmni.Common.Constants.bahmniBacteriologyResultsUrl, {
                method: "GET",
                params: params,
                withCredentials: true
            });
        };

        var saveBacteriologyResults = function (specimen) {
            return $http.post(Bahmni.Common.Constants.bahmniBacteriologyResultsUrl, specimen, {
                withCredentials: true
            });
        };

        return {
            getBacteriologyResults: getBacteriologyResults,
            saveBacteriologyResults: saveBacteriologyResults
        };
    }]);
