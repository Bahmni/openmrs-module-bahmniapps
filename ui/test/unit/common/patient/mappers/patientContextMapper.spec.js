'use strict';

describe('patient context mapper', function () {
    var patientContextMapper = new Bahmni.PatientContextMapper();

    it("should assign identifier if primary identifier is undefined", function () {
        var patient = {
            "uuid": "8a76aad9-9a2a-4686-de9c-caf0c89bc89c",
            "person": {
                "names": [
                    {
                        "givenName": "Test",
                        "middleName": null,
                        "familyName": "Patient"
                    }
                ],
                "birthdateEstimated": false,
                "gender": "M"
            },
            "identifiers": [{
                "identifierType": {
                    "name": "OpenMRS Identification Number",
                    "required": false,
                    "primary": false
                },
                "preferred": false,
                "identifier": "OS1234",
                "primaryIdentifier": undefined,
                "extraIdentifiers": {"OpenMRS Identification Number": "OS1234"}
            }, {
                "identifierType": {
                    "name": "Patient Identifier",
                    "required": true,
                    "primary": true
                },
                "preferred": true,
                "voided": false,
                "identifier": undefined,
                "primaryIdentifier": undefined,
                "extraIdentifiers": {"OpenMRS Identification Number": "OS1234"}
            }]
        };
        var mappedPatient = {
            uuid: '8a76aad9-9a2a-4686-de9c-caf0c89bc89c',
            givenName: 'Test',
            familyName: 'Patient',
            middleName: null,
            gender: 'M',
            identifier: 'OS1234'
        };
        expect(patientContextMapper.map(patient)).toEqual(mappedPatient);
    });

    it("should assign primary identifier if it is defined", function () {
        var patient = {
            "uuid": "8a76aad9-9a2a-4686-de9c-caf0c89bc89c",
            "person": {
                "names": [
                    {
                        "givenName": "Test",
                        "middleName": null,
                        "familyName": "Patient"
                    }
                ],
                "birthdateEstimated": false,
                "gender": "M"
            },
            "identifiers": [{
                "identifierType": {
                    "name": "OpenMRS Identification Number",
                    "required": false,
                    "primary": false
                },
                "preferred": false,
                "identifier": "OS1234",
                "primaryIdentifier": "BDH202048",
                "extraIdentifiers": {"OpenMRS Identification Number": "OS1234"}
            }, {
                "identifierType": {
                    "name": "Patient Identifier",
                    "required": true,
                    "primary": true
                },
                "preferred": true,
                "voided": false,
                "identifier": "BDH202048",
                "primaryIdentifier": "BDH202048",
                "extraIdentifiers": {"OpenMRS Identification Number": "OS1234"}
            }]
        };
        var mappedPatient = {
            uuid: '8a76aad9-9a2a-4686-de9c-caf0c89bc89c',
            givenName: 'Test',
            familyName: 'Patient',
            middleName: null,
            gender: 'M',
            identifier: 'BDH202048'
        };
        expect(patientContextMapper.map(patient)).toEqual(mappedPatient);
    })
});