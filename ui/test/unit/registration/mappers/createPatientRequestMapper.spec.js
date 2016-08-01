'use strict';

describe('patient mapper', function () {

    var patient;
    var patientAttributeTypes;
    var date = new Date();

    beforeEach(function () {
        module('bahmni.registration');
        module('bahmni.common.models');
        inject(['patient', function (patientFactory) {
            patient = patientFactory.create();
        }]);

        patientAttributeTypes = [
            {
                "uuid": "class-uuid",
                "sortWeight": 2.0,
                "name": "class",
                "description": "Caste",
                "format": "java.lang.String",
                "answers": []
            },
            {
                "uuid": "caste-uuid",
                "sortWeight": 2.0,
                "name": "caste",
                "description": "Class",
                "format": "org.openmrs.Concept",
                "answers": [
                    {"description": "OBC", "conceptId": "10"}
                ]
            },
            {
                "uuid": "education-uuid",
                "sortWeight": 2.0,
                "name": "education",
                "description": "Caste",
                "format": "java.lang.String",
                "answers": []
            },
            {
                "uuid": "isUrban-uuid",
                "sortWeight": 2.0,
                "name": "isUrban",
                "description": "isUrban",
                "format": "java.lang.Boolean",
                "answers": []
            },
            {
                "uuid": "testDate-uuid",
                "sortWeight": 2.0,
                "name": "testDate",
                "description": "Test Date",
                "format": "org.openmrs.util.AttributableDate",
                "answers": []
            }
        ];

    });

    it('should map angular patient model to openmrs patient', function () {

        angular.extend(patient, {
            "givenName": "gname",
            "familyName": "fname",
            "address": {
                "address1": "house street",
                "address2": "grampan",
                "address3": "tehsil",
                "cityVillage": "vill",
                "countyDistrict": "dist",
                "stateProvince": "stat"
            },
            "birthdate": moment(date).format("DD-MM-YYYY"),
            "age": {
                "years": 0,
                "months": 4,
                "days": 17
            },
            "gender": "M",
            "identifiers": [
                {
                    "selectedIdentifierSource": {"prefix": "GAN", "uuid": "dead-cafe"},
                    "identifier": "GAN200011",
                    "identifierType": {"uuid": "someUuid"},
                    "preferred":true,
                    "voided":false
                },
                {
                    "identifier": "GAN200012",
                    "identifierType": {"uuid": "otherUuid"},
                    "preferred":false,
                    "voided":false

                }],
            "registrationDate": moment(date).format(),
            "caste": "10",
            "education": "16",
            "occupation": "23",
            "primaryContact": "primary cont",
            "secondaryContact": "second cont",
            "healthCenter": "2",
            "primaryRelative": "fathus name",
            "class": "10",
//            "image": "/patient_images/GAN200011.jpeg?q=1379938731779",
            "givenNameLocal": "fhindi",
            "familyNameLocal": "lhindi",
            "secondaryIdentifier": "sec id",
            "isNew": "true",
            "isUrban": false,
            "dead": true,
            "testDate": "Fri Jan 01 1999 00:00:00"
        });

        var openmrsPatient = new Bahmni.Registration.CreatePatientRequestMapper(new Date()).mapFromPatient(patientAttributeTypes, patient);

        expect(openmrsPatient.patient.person.names).toEqual([
            {
                givenName: "gname",
                familyName: "fname",
                middleName: undefined,
                "preferred": false
            }
        ]);

        expect(openmrsPatient.patient.person.addresses).toEqual([
            {
                address1: "house street",
                address2: "grampan",
                address3: "tehsil",
                cityVillage: "vill",
                countyDistrict: "dist",
                stateProvince: "stat"
            }
        ]);

        expect(openmrsPatient.patient.person.gender).toBe("M");

        expect(openmrsPatient.patient.person.dead).toBe(true);

        expect(openmrsPatient.patient.person.deathDate).toBe(null);

        expect(openmrsPatient.patient.person.causeOfDeath).toBe('');

        expect(openmrsPatient.patient.identifiers).toEqual([
            {
                "identifier": "GAN200011",
                "identifierSourceUuid" : "dead-cafe",
                "identifierPrefix": "GAN",
                "identifierType": "someUuid",
                "preferred": true,
                "voided": false
            },{
                "identifier": "GAN200012",
                "identifierSourceUuid": undefined,
                "identifierPrefix": undefined,
                "identifierType": "otherUuid",
                "preferred": false,
                "voided": false
            }
        ]);

        expect(openmrsPatient.patient.person.personDateCreated).toBe(moment(date).format());
    });

    it('should map age to birthdate', function () {
        angular.extend(patient, {
            "age": {
                "years": 1,
                "months": 1,
                "days": 7
            }
        });

        var openmrsPatient = new Bahmni.Registration.CreatePatientRequestMapper(date).mapFromPatient(patientAttributeTypes, patient);
        var dob = moment();
        dob = dob.subtract(7, 'days').subtract(1, 'months').subtract(1, 'years');
        expect(moment(openmrsPatient.patient.person.birthdate).format('YYYY-MM-DD')).toBe(dob.format('YYYY-MM-DD'));
    });

    it('should map birthdate to age and birthdate', function () {

        angular.extend(patient, {
            "birthdate": date
        });

        var openmrsPatient = new Bahmni.Registration.CreatePatientRequestMapper(date).mapFromPatient(patientAttributeTypes, patient);

        expect(moment(openmrsPatient.patient.person.birthdate).format('YYYY-MM-DD')).toBe(moment(date).format("YYYY-MM-DD"));
    });

    it('should not use age when birthdate is present', function () {

        angular.extend(patient, {
            "birthdate": date,
            "age": {
                "years": 1,
                "months": 1,
                "days": 17
            }
        });

        var openmrsPatient = new Bahmni.Registration.CreatePatientRequestMapper(new Date('2013-09-23')).mapFromPatient(patientAttributeTypes, patient);

        expect(moment(openmrsPatient.patient.person.birthdate).format('YYYY-MM-DD')).toBe(moment(date).format("YYYY-MM-DD"));
        expect(openmrsPatient.patient.person.birthdateEstimated).toBeFalsy();
    });

    it('should strip data prefix when image is a jpeg data url', function () {
        angular.extend(patient, {
            image: 'data:image/jpeg;base64,asdfasdfasdfkalsdfkj'
        });

        var mappedPatientData = new Bahmni.Registration.CreatePatientRequestMapper().mapFromPatient(patientAttributeTypes, patient);

        expect(mappedPatientData.image).toBe('asdfasdfasdfkalsdfkj');
    });

    it('should map image if it is a data image', function () {
        angular.extend(patient, {
            image: 'asdfasdfasdfkalsdfkj'
        });

        var mappedPatientData = new Bahmni.Registration.CreatePatientRequestMapper().mapFromPatient(patientAttributeTypes, patient);

        expect(mappedPatientData.image).toBeFalsy();
    });

    it('should not fail when image not present', function () {
        angular.extend(patient, {
            image: null
        });

        var mappedPatientData = new Bahmni.Registration.CreatePatientRequestMapper().mapFromPatient(patientAttributeTypes, patient);

        expect(mappedPatientData.image).toBeFalsy();
    });

});
