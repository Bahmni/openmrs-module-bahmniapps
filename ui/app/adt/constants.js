/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

var Bahmni = Bahmni || {};
Bahmni.ADT = Bahmni.ADT || {};

Bahmni.ADT.Constants = (function () {
    return {
        patientsListUrl: "/patient/search",
        ipdDashboardUrl: "#/patient/{{patientUuid}}/visit/{{visitUuid}}/",
        admissionLocationUrl: "/openmrs/ws/rest/v1/admissionLocation/",
        mfeIpdDashboardUrl: Bahmni.Common.Constants.hostURL + '/bahmni/clinical/#/default/patient/{{patientUuid}}/dashboard/visit/ipd/{{visitUuid}}?source=adt'
    };
})();

