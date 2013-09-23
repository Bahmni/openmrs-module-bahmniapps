'use strict';


describe('patientMapper', function () {
    var patient;
    var patientConfiguration;

    beforeEach(function () {
        module('registration.patient.models');
        inject(['patient', function (patientFactory) {
            patient = patientFactory.create();
        }]);

        patientConfiguration = new PatientConfig([
            {"uuid": "d3d93ab0-e796-11e2-852f-0800271c1b75", "sortWeight": 2.0, "name": "caste", "description": "Caste", "format": "java.lang.String", "answers": []},
            {"uuid": "d3e6dc74-e796-11e2-852f-0800271c1b75", "sortWeight": 2.0, "name": "class", "description": "Class", "format": "org.openmrs.Concept",
                "answers": [
                    {"description": "OBC", "conceptId": "10"}
                ]}
        ]);

    });

    it('should map givenName and familyName to name array', function () {
        angular.extend(patient, {
            "givenName": "given",
            "familyName": "family"
        });

        var mappedPatientData = new PatientMapper().map(patientConfiguration, patient);

        expect(mappedPatientData.names[0].givenName).toBe("given");
        expect(mappedPatientData.names[0].familyName).toBe("family");
    });

    it('should map the address', function () {
        angular.extend(patient, {
            address: {
                address1: "12th Main",
                cityVillage: "Koramangala",
                address3: "Bangalore",
                countyDistrict: "Bangalore",
                stateProvince: "Karnataka"
            }
        });

        var mappedPatientData = new PatientMapper().map(patientConfiguration, patient);

        expect(mappedPatientData.addresses[0]).toBe(patient.address);
    });

    it('should map the attributes', function () {
        angular.extend(patient, {
            "caste": "someCaste",
            "class": "10"
        });

        var mappedPatientData = new PatientMapper().map(patientConfiguration, patient);

        expect(mappedPatientData.attributes[0]).toEqual({"attributeType": "d3d93ab0-e796-11e2-852f-0800271c1b75", "name": "caste", "value": "someCaste"});
        expect(mappedPatientData.attributes[1]).toEqual({"attributeType": "d3e6dc74-e796-11e2-852f-0800271c1b75", "name": "class", "value": "10"});
    });

    it('should map age, gender and dateOfBirth', function () {
        angular.extend(patient, {
            age: {years: 23, months: 11, days: 22},
            gender: "F",
            birthdate: "06-26-1989"
        });

        var mappedPatientData = new PatientMapper().map(patientConfiguration, patient);

        expect(mappedPatientData.age).toEqual(patient.age);
        expect(mappedPatientData.gender).toEqual('F');
        expect(mappedPatientData.birthdate).toEqual("06-26-1989");
    });

    it('should strip data prefix when image is a jpeg data url', function () {
        angular.extend(patient, {
            image: 'data:image/jpeg;base64,asdfasdfasdfkalsdfkj'
        });

        var mappedPatientData = new PatientMapper().map(patientConfiguration, patient);

        expect(mappedPatientData.image).toBe('asdfasdfasdfkalsdfkj');
    });

    it('should map image if it is a data image', function () {
        angular.extend(patient, {
            image: 'asdfasdfasdfkalsdfkj'
        });

        var mappedPatientData = new PatientMapper().map(patientConfiguration, patient);

        expect(mappedPatientData.image).toBeFalsy();
    });

    it('should not fail when image not present', function () {
        angular.extend(patient, {
            image: null
        });

        var mappedPatientData = new PatientMapper().map(patientConfiguration, patient);

        expect(mappedPatientData.image).toBeFalsy();
    });
});
