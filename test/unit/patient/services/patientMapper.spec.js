'use strict';


describe('patientMapper', function() {

    var patientMapper;

    var samplePatientAttributeTypes = [
            {
                "uuid": "be4f3f8a-862c-11e2-a490-afe87ebb32c9",
                "name": "oldPatientIdentifier",
            },
            {
                "uuid": "c3a345c6-862c-11e2-a490-afe87ebb32c9",
                "name": "caste",
            }
        ];

    var mockPatientAttributeType = {
        getAll: function () {
            return samplePatientAttributeTypes;
        }
    }

    beforeEach(function() {
        module('resources.patientMapper');

        module(function ($provide) {
            $provide.value('patientAttributeType', mockPatientAttributeType);
        });

        inject(['patientMapper', function(patientMapperInjectted) {
            patientMapper = patientMapperInjectted;
        }]);

    });

    it('should map givenName and familyName to name array', function () {
        var patient = {
            "givenName": "given",
            "familyName": "family"
        };

        var mappedPatientData = patientMapper.map(patient);

        expect(mappedPatientData.names[0].givenName).toBe("given");
        expect(mappedPatientData.names[0].familyName).toBe("family");
    });

    it('should map the address', function () {
        var patient = {
            address : {
                address1: "12th Main",
                cityVillage: "Koramangala",
                address3: "Bangalore",
                countyDistrict: "Bangalore",
                stateProvince: "Karnataka",
            }
        };

        var mappedPatientData = patientMapper.map(patient);

        expect(mappedPatientData.addresses[0]).toBe(patient.address);
    });

    it('should map the attributes', function () {
        var patient = {
            "caste": "someCaste",
            "oldPatientIdentifier": "someOldPatientIdentifier",
        } ;

        var mappedPatientData = patientMapper.map(patient);

        expect(mappedPatientData.attributes[0]).toEqual({"attributeType": "be4f3f8a-862c-11e2-a490-afe87ebb32c9", "name": "oldPatientIdentifier", "value": "someOldPatientIdentifier"});
        expect(mappedPatientData.attributes[1]).toEqual({"attributeType": "c3a345c6-862c-11e2-a490-afe87ebb32c9", "name": "caste", "value": "someCaste"});
    });

    it('should map age, gender and dateOfBirth', function () {
        var patient = {
            age: 23,
            gender: "F",
            birthdate: "06-26-1989"
        } ;

        var mappedPatientData = patientMapper.map(patient);

        expect(mappedPatientData.age).toEqual(23);
        expect(mappedPatientData.gender).toEqual('F');
        expect(mappedPatientData.birthdate).toEqual("06-26-1989");
    });
})
