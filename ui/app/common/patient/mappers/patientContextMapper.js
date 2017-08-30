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

        return patientContext;
    };

    var parseDate = function (dateStr) {
        if (dateStr) {
            return Bahmni.Common.Util.DateUtil.parse(dateStr.substr(0, 10));
        }
        return dateStr;
    };
};
