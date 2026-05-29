/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.common.util')
    .factory('allergyService', ['$http', '$q', 'appService', function ($http, $q, appService) {
        const getAllergyForPatient = function (patientUuid) {
            const patientAllergyURL = appService.getAppDescriptor().formatUrl(Bahmni.Common.Constants.patientAllergiesURL, {'patientUuid': patientUuid});
            return $http.get(patientAllergyURL, {
                method: "GET",
                withCredentials: true,
                cache: false
            });
        };

        var fetchAndProcessAllergies = function (patientUuid) {
            return $q.all([
                getAllergyForPatient(patientUuid),
                getNoKnownAllergyUuid()
            ]).then(function (responses) {
                var allergies = responses[0].data;
                var noKnownAllergyUuid = responses[1];
                var allergiesList = [];
                if (responses[0].status === 200 && allergies.entry && allergies.entry.length > 0) {
                    allergies.entry.forEach(function (allergy) {
                        if (allergy.resource.code.coding) {
                            allergiesList.push({
                                display: allergy.resource.code.coding[0].display,
                                allergenCode: allergy.resource.code.coding[0].code
                            });
                        }
                    });
                }
                if (allergiesList.length > 1) {
                    allergiesList = allergiesList.filter(function (allergy) {
                        return allergy.allergenCode !== noKnownAllergyUuid;
                    });
                }
                return allergiesList.map(function (allergy) { return allergy.display; }).join(", ");
            });
        };
        const getNoKnownAllergyUuid = function () {
            return $http.get(Bahmni.Common.Constants.globalPropertyUrl, {
                method: "GET",
                params: {
                    property: 'allergy.concept.noKnownAllergyUuid'
                },
                withCredentials: true,
                headers: {
                    Accept: 'text/plain'
                }
            }).then(function (response) {
                return response.data;
            });
        };

        return {
            getAllergyForPatient: getAllergyForPatient,
            fetchAndProcessAllergies: fetchAndProcessAllergies,
            getNoKnownAllergyUuid: getNoKnownAllergyUuid
        };
    }]);
