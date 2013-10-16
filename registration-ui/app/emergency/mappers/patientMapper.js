'use strict';

Bahmni.Registration.Emergency.PatientMapper = function() {
    this.map = function (patientConfig, patient) {
        return {
            names: [
                {
                    familyName: patient.familyName || "Unknown", 
                    givenName: patient.givenName || "Unknown"
                }
            ],
            age: patient.age,
            gender: patient.gender,
            identifier: patient.identifier,
            centerID: patient.centerID,
            addresses: [patient.address],
            attributes: [],
        };
    };
}