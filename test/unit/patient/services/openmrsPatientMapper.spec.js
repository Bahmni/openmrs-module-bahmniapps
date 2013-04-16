'use strict';

describe('patientMapper', function() {

    var mapper, openmrsPatient = {
        "uuid": "1a202b45-ffa3-42a1-9177-c718e6119cfd",
        "identifiers": [
            {
                "identifier": "GAN200003"
            }
        ],
        "person": {
            "gender": "F",
            "age": 0,
            "birthdate": "2013-04-01T00:00:00.000+0530",
            "birthdateEstimated": false,
            "preferredName": {
                "uuid": "72573d85-7793-49c1-8c29-7647c0a6a425",
                "givenName": "first",
                "middleName": "middle",
                "familyName": "family"
            },

            "preferredAddress": {
                "display": "house1243",
                "uuid": "7746b284-82d5-4251-a7ec-6685b0ced206",
                "preferred": true,
                "address1": "house1243",
                "address2": null,
                "cityVillage": "village22",
                "stateProvince": "state",
                "countyDistrict": "dist",
                "address3": "tehsilkk"
            },
            "attributes": [
                {
                    "uuid": "2a71ee67-3446-4f66-8267-82446bda21a7",
                    "value": "singh",
                    "attributeType": {
                        "uuid": "0a71ee67-3446-4f66-8267-82446bda21a7"
                    }
                } ,
                {
                    "uuid": "3da8141e-65d6-452e-9cfe-ce813bd11d52",
                    "value": "Uneducated",
                    "attributeType": {
                        "uuid": "bda8141e-65d6-452e-9cfe-ce813bd11d52"
                    }
                }
            ]
        }
    };


    var samplePatientAttributeTypes = [
        {
            "uuid": "0a71ee67-3446-4f66-8267-82446bda21a7",
            "name": "caste"
        },
        {
            "uuid": "bda8141e-65d6-452e-9cfe-ce813bd11d52",
            "name": "education"
        }
    ];


    var mockPatientAttributeType = {
        get: function(uuid){ return samplePatientAttributeTypes.filter(function(attribute){return uuid === attribute.uuid})[0];},
        initialization: {success: function(callBack){return callBack();}}
    };

    beforeEach(function() {
        module('resources.openmrsPatientMapper');

        module(function ($provide) {
            $provide.value('patientAttributeType', mockPatientAttributeType);
        });

        inject(['openmrsPatientMapper', function(openmrsPatientMapper) {
            mapper = openmrsPatientMapper;
        }]);

    });


    it('should map values from the openmrs Patient to our patient object', function () {

        var patient = mapper.map(openmrsPatient);
        expect(patient.givenName).toBe(openmrsPatient.person.preferredName.givenName);
        expect(patient.familyName).toBe(openmrsPatient.person.preferredName.familyName);
        expect(patient.gender).toBe(openmrsPatient.person.gender);
        expect(patient.age).toBe(openmrsPatient.person.age);
        expect(patient.patientIdentifier).toBe(openmrsPatient.identifiers[0].identifier);
        expect(patient.address.address1).toBe(openmrsPatient.person.preferredAddress.address1);
        expect(patient.address.address2).toBe(openmrsPatient.person.preferredAddress.address2);
        expect(patient.address.address3).toBe(openmrsPatient.person.preferredAddress.address3);
        expect(patient.address.cityVillage).toBe(openmrsPatient.person.preferredAddress.cityVillage);
        expect(patient.address.countyDistrict).toBe(openmrsPatient.person.preferredAddress.countyDistrict);
        expect(patient.address.stateProvince).toBe(openmrsPatient.person.preferredAddress.stateProvince);
        expect(patient.image).toBe("/patient_images/" + openmrsPatient.identifiers[0].identifier + ".jpeg");
    });

    it('should map attributes from openmrsPatient to our patient object', function() {
        var patient = mapper.map(openmrsPatient);
        expect(patient.education).toBe("Uneducated");
    });

    it('should map birth date in dd-mm-yyyy format', function() {
        openmrsPatient.person.birthdate =  "2013-04-01T00:00:00.000+0530";
        var patient = mapper.map(openmrsPatient);
        expect(patient.birthdate).toBe('01-04-2013');
    });

    it("should populate birthdate only if dateEstimated is false", function() {
        openmrsPatient.person.birthdate =  "2013-04-01T00:00:00.000+0530";
        openmrsPatient.person.birthdateEstimated =  true;
        var patient = mapper.map(openmrsPatient);
        expect(patient.birthdate).toBeFalsy();

        openmrsPatient.person.birthdate =  "2013-04-01T00:00:00.000+0530";
        openmrsPatient.person.birthdateEstimated =  false;
        var patient = mapper.map(openmrsPatient);
        expect(patient.birthdate).toBe('01-04-2013');
    });

    it("should not fail if preferred address is null", function() {
        openmrsPatient.person.preferredAddress = null;
        mapper.map(openmrsPatient);
    });
});
