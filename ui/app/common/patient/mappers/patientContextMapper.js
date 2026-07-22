/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

Bahmni.PatientContextMapper = function () {
    this.map = function (patient) {
        var patientContext = {};
        patientContext.uuid = patient.uuid;
        patientContext.givenName = patient.person.names[0].givenName;
        var familyName = patient.person.names[0].familyName;
        patientContext.familyName = familyName ? familyName : "";
        patientContext.middleName = patient.person.names[0].middleName;
        patientContext.gender = patient.person.gender;
        if (patient.identifiers) {
            var primaryIdentifier = patient.identifiers[0].primaryIdentifier;
            patientContext.identifier = primaryIdentifier ? primaryIdentifier : patient.identifiers[0].identifier;
        }

        if (patient.person.birthdate) {
            patientContext.birthdate = parseDate(patient.person.birthdate);
        }

        patientContext.isDead = patient.person.dead || false;
        return patientContext;
    };

    var parseDate = function (dateStr) {
        if (dateStr) {
            return Bahmni.Common.Util.DateUtil.parse(dateStr.substr(0, 10));
        }
        return dateStr;
    };
};
