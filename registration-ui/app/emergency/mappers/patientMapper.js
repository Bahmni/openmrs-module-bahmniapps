'use strict';

Bahmni.Registration.Emergency.PatientMapper = function() {
    this.map = function (patientConfig, patient) {
        if(patient.address.cityVillage == null) {
            patient.address.cityVillage = "Unknown";
        }
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
            centerID: patient.identifierPrefix.name,
            addresses: [patient.address],
            attributes: []
        };
    };
};
