'use strict';

Bahmni.Common.Util.FhirUtil = (function () {
    var nationalIdName = "National Id";
    let extraIdentifierTypes = ["National ID No", "Passport No", "Birth Certificate No"];

    var transformResponse = function (entry) {
        if (entry.resource.resourceType.toLowerCase() == 'patient') {
            return transformPatient(entry.resource);
        }
    };

    var transformPatient = function (resource) {
        let patient = {};
        patient.uuid = resource.id;
        patient.identifier = resource.id;
        //Calculate age
        patient.age = 44
        patient.birthdate_estimated = false
        patient.identifiers= [];
        resource.identifier && _.each(resource.identifier, function (identifier) {
            patient.identifiers.push({
                "type": identifier.type.text,
                "value": identifier.value
            })
        });

        patient.active = resource.active;
        resource.name && _.each(resource.name, function (name) {
            patient.family_name = name.family;
            patient.given_name = name.given[0];
            if (name.given.length > 1) {
                patient.middle_name = name.given[1];
            }
        });

        patient.gender = resource.gender;
        patient.birthdate = resource.birthDate;
        patient.local = false;
        patient.extraIdentifiers = "";
        _.each(resource.identifier, function (identifier) {
            var result = extraIdentifierTypes.findIndex(item => item.toUpperCase() === identifier.type.text.toUpperCase());
            if (result !== -1) {
                if (patient.extraIdentifiers) {
                    patient.extraIdentifiers += ","
                }
                patient.extraIdentifiers += identifier.type.text + ":" + identifier.value;
            }
            
        });
        return patient;
    };

    return {
        transformResponse: transformResponse
    };
})();
