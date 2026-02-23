/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

angular.module('bahmni.common.domain')
    .factory('dispositionService', ['$http', '$rootScope', function ($http, $rootScope) {
        var getDispositionActions = function () {
            return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl +
                "&name=" + Bahmni.Common.Constants.dispositionConcept +
                "&v=custom:(uuid,name,answers:(uuid,name,mappings))", {cache: true});
        };

        var getDispositionNoteConcept = function () {
            return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl +
                "&name=" + Bahmni.Common.Constants.dispositionNoteConcept +
                "&v=custom:(uuid,name:(name))", {cache: true});
        };

        var getDispositionByVisit = function (visitUuid) {
            return $http.get(Bahmni.Common.Constants.bahmniDispositionByVisitUrl, {
                params: {visitUuid: visitUuid,
                    locale: $rootScope.currentUser.userProperties.defaultLocale}
            });
        };

        var getDispositionByPatient = function (patientUuid, numberOfVisits) {
            return $http.get(Bahmni.Common.Constants.bahmniDispositionByPatientUrl, {
                params: {
                    patientUuid: patientUuid,
                    numberOfVisits: numberOfVisits,
                    locale: $rootScope.currentUser.userProperties.defaultLocale
                }
            });
        };

        return {
            getDispositionActions: getDispositionActions,
            getDispositionNoteConcept: getDispositionNoteConcept,
            getDispositionByVisit: getDispositionByVisit,
            getDispositionByPatient: getDispositionByPatient
        };
    }]);
