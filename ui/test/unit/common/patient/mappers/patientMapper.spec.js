'use strict';

describe('patient mapper', function () {
    var patientConfig, rootScope, translate;
    patientConfig = {};
    rootScope = {
        genderMap: {
            "M": "Male",
            "F": "Female",
            "O": "Transgender"
        }
    };
    translate = jasmine.createSpyObj('$translate', ['instant']);
    var patientMapper = new Bahmni.PatientMapper(patientConfig, rootScope, translate);

    it("should map secondary identifier if primary identifier is undefined", function () {
        var patient = {
            "person": {
                "birthdate": "1984-08-10T14:16:34.994+0530",
                "birthdateEstimated": true,
                "gender": "M",
                "birthtime": "1970-01-01T04:20:00.000+0530",
                "preferredName": {
                    "givenName": "Test",
                    "familyName": "Patient"
                },
                "preferredAddress": {
                    "preferred": true,
                    "address1": "Ad56",
                    "address2": null,
                    "address3": "Baria",
                    "address4": "Unions Of Gazipur Sadar Upazila",
                    "address5": "Gazipur Sadar",
                    "address6": null,
                    "cityVillage": null,
                    "countyDistrict": "Gazipur",
                    "stateProvince": "Dhaka",
                    "postalCode": null,
                    "country": null
                }
            },
            "identifiers": [{
                "identifier": "OS1234",
                "primaryIdentifier": undefined,
                "extraIdentifiers": {"OpenMRS Identification Number": "OS1234"}
            }, {
                "identifier": undefined,
                "primaryIdentifier": undefined,
                "extraIdentifiers": {"OpenMRS Identification Number": "OS1234"}
            }],
            "uuid": "8a76aad9-9a2a-4686-de9c-caf0c89bc89c"
        };

        expect(patientMapper.mapBasic(patient).identifier).toEqual('OS1234');
    });

    it("should map additional identifiers if more than one identifier is there", function () {
        var patient = {
            "person": {
                "birthdate": "1984-08-10T14:16:34.994+0530",
                "birthdateEstimated": true,
                "gender": "M",
                "birthtime": "1970-01-01T04:20:00.000+0530",
                "preferredName": {
                    "givenName": "Test",
                    "familyName": "Patient"
                },
                "preferredAddress": {
                    "preferred": true,
                    "address1": "Ad56",
                    "address2": null,
                    "address3": "Baria",
                    "address4": "Unions Of Gazipur Sadar Upazila",
                    "address5": "Gazipur Sadar",
                    "address6": null,
                    "cityVillage": null,
                    "countyDistrict": "Gazipur",
                    "stateProvince": "Dhaka",
                    "postalCode": null,
                    "country": null
                }
            },
            "identifiers": [{
                "identifier": "OS1234",
                "primaryIdentifier": "BDH202048",
                "extraIdentifiers": {"OpenMRS Identification Number": "OS1234"}
            }, {
                "identifier": "1234567891123",
                "primaryIdentifier": undefined,
                "identifierType": {
                    "uuid": "ada0b55b-0e3e-11ee-9960-0242ac150002",
                    "display": "ABHA Number",
                },
            }],
            "uuid": "8a76aad9-9a2a-4686-de9c-caf0c89bc89c"
        };
        expect(patientMapper.mapBasic(patient).additionalIdentifiers).toEqual({ "ABHA Number" : { label : 'ABHA Number', value : '1234567891123' } } );
    });
    
    it("should map primary identifier if it is there", function () {
        var patient = {
            "person": {
                "birthdate": "1984-08-10T14:16:34.994+0530",
                "birthdateEstimated": true,
                "gender": "M",
                "birthtime": "1970-01-01T04:20:00.000+0530",
                "preferredName": {
                    "givenName": "Test",
                    "familyName": "Patient"
                },
                "preferredAddress": {
                    "preferred": true,
                    "address1": "Ad56",
                    "address2": null,
                    "address3": "Baria",
                    "address4": "Unions Of Gazipur Sadar Upazila",
                    "address5": "Gazipur Sadar",
                    "address6": null,
                    "cityVillage": null,
                    "countyDistrict": "Gazipur",
                    "stateProvince": "Dhaka",
                    "postalCode": null,
                    "country": null
                }
            },
            "identifiers": [{
                "identifier": "OS1234",
                "primaryIdentifier": "BDH202048",
                "extraIdentifiers": {"OpenMRS Identification Number": "OS1234"}
            }, {
                "identifier": "BDH202048",
                "primaryIdentifier": "BDH202048",
                "extraIdentifiers": {"OpenMRS Identification Number": "OS1234"}
            }],
            "uuid": "8a76aad9-9a2a-4686-de9c-caf0c89bc89c"
        };

        expect(patientMapper.mapBasic(patient).identifier).toEqual('BDH202048');
    });

});