'use strict';


describe('patientMapper', function() {
    var patientMapper;
    var patient;


    var samplePatientAttributeTypes = [
            {
                "uuid": "be4f3f8a-862c-11e2-a490-afe87ebb32c9",
                "name": "oldPatientIdentifier"
            },
            {
                "uuid": "c3a345c6-862c-11e2-a490-afe87ebb32c9",
                "name": "caste"
            }
        ];

    var mockPatientAttributeType = {
        getAll: function () {
            return samplePatientAttributeTypes;
        }
    }

    beforeEach(function() {
        module('registration.patient.mappers');
        module('registration.patient.models');
        
        module(function ($provide) {
            $provide.value('patientAttributeType', mockPatientAttributeType);
        });

        inject(['patientMapper', 'patient', function(patientMapperInjectted, patientFactory) {
            patientMapper = patientMapperInjectted;
            patient = patientFactory.create();
        }]);

    });

    it('should map givenName and familyName to name array', function () {
        angular.extend(patient, {
            "givenName": "given",
            "familyName": "family"
        });

        var mappedPatientData = patientMapper.map(patient);

        expect(mappedPatientData.names[0].givenName).toBe("given");
        expect(mappedPatientData.names[0].familyName).toBe("family");
    });

    it('should map the address', function () {
        angular.extend(patient, {
            address : {
                address1: "12th Main",
                cityVillage: "Koramangala",
                address3: "Bangalore",
                countyDistrict: "Bangalore",
                stateProvince: "Karnataka",
            }
        });

        var mappedPatientData = patientMapper.map(patient);

        expect(mappedPatientData.addresses[0]).toBe(patient.address);
    });

    it('should map the attributes', function () {
        angular.extend(patient, {
            "caste": "someCaste",
            "oldPatientIdentifier": "someOldPatientIdentifier",
        });

        var mappedPatientData = patientMapper.map(patient);

        expect(mappedPatientData.attributes[0]).toEqual({"attributeType": "be4f3f8a-862c-11e2-a490-afe87ebb32c9", "name": "oldPatientIdentifier", "value": "someOldPatientIdentifier"});
        expect(mappedPatientData.attributes[1]).toEqual({"attributeType": "c3a345c6-862c-11e2-a490-afe87ebb32c9", "name": "caste", "value": "someCaste"});
    });

    it('should map age, gender and dateOfBirth', function () {
        angular.extend(patient, {
            age: {years: 23, months: 11, days: 22},
            gender: "F",
            birthdate: "06-26-1989"
        });

        var mappedPatientData = patientMapper.map(patient);

        expect(mappedPatientData.age).toEqual(patient.age);
        expect(mappedPatientData.gender).toEqual('F');
        expect(mappedPatientData.birthdate).toEqual("06-26-1989");
    });

    it('should strip data prefix when image is a jpeg data url', function () {
        angular.extend(patient, {
            image: 'data:image/jpeg;base64,asdfasdfasdfkalsdfkj'
        });
        
        var mappedPatientData = patientMapper.map(patient);
        
        expect(mappedPatientData.image).toBe('asdfasdfasdfkalsdfkj');
    });

    it('should map image if it is a data image', function () {
        angular.extend(patient, {
            image: 'asdfasdfasdfkalsdfkj'
        });

        var mappedPatientData = patientMapper.map(patient);
        
        expect(mappedPatientData.image).toBeFalsy();
    });

    it('should not fail when image not present', function () {
        angular.extend(patient, {
            image: null
        });

        var mappedPatientData = patientMapper.map(patient);
        
        expect(mappedPatientData.image).toBeFalsy();
    });
})
