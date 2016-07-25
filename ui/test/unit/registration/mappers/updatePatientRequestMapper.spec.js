'use strict';

describe('patient mapper', function () {

    var patient;
    var patientAttributeTypes;
    var date = new Date();
    var updatePatientRequestMapper = new Bahmni.Registration.UpdatePatientRequestMapper();
    var openMrsPatient;

    beforeEach(function () {
        module('bahmni.registration');
        module('bahmni.common.models');
        inject(['patient', function (patientFactory) {
            patient = patientFactory.create();
        }]);

        patientAttributeTypes = [
            {"uuid": "class-uuid", "sortWeight": 2.0, "name": "class", "description": "Caste", "format": "java.lang.String", "answers": []},
            {"uuid": "caste-uuid", "sortWeight": 2.0, "name": "caste", "description": "Class", "format": "org.openmrs.Concept",
                "answers": [
                    {"description": "OBC", "conceptId": "10"},
                    {"description": "General", "conceptId": "11"}
                ]
            },
            {"uuid": "education-uuid", "sortWeight": 2.0, "name": "education", "description": "Caste", "format": "java.lang.String", "answers": []},
            {"uuid": "isUrban-uuid", "sortWeight": 2.0, "name": "isUrban", "description": "isUrban", "format": "java.lang.Boolean", "answers": []},
            {"uuid": "testDate-uuid", "sortWeight": 2.0, "name": "testDate", "description": "Test Date", "format": "org.openmrs.util.AttributableDate", "answers": []}
        ];

        angular.extend(patient, {
            "givenName": "gname",
            "familyName": "fname",

            "birthdate": moment(date).format("DD-MM-YYYY"),
            "age": {
                "years": 0,
                "months": 4,
                "days": 17
            },
            "gender": "M",
            "identifier": "GAN200011",
            "registrationDate": moment(date).format(),
            "caste": null,
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
            "isUrban":false,
            "dead": true,
            "testDate": "Fri Jan 01 1999 00:00:00"
        });

        openMrsPatient = {
                person: {
                    names: [
                        {
                            uuid: "2wft3",
                            givenName: "gname",
                            familyName: "fname",
                            "preferred": true
                        }
                    ],
                    "birthdate": moment(date).format("DD-MM-YYYY"),
                    gender: "M",
                    attributes: [ {
                        attributeType:{
                            uuid:"caste-uuid",
                            display :"caste"

                        },

                        uuid: "caste-attribute-uuid",

                        value: {
                            uuid:"11",
                            display:"General"
                        }
                    }]
                }
        };

    });


    it('should set voided flag when Empty value is selected for concept attribute type(dropdown)', function () {

        var mappedPatientData = updatePatientRequestMapper.mapFromPatient(patientAttributeTypes, openMrsPatient, patient);

        var castePatientAttribute = _.find(mappedPatientData.patient.person.attributes,{uuid : "caste-attribute-uuid"})
        expect(castePatientAttribute.voided).toBeTruthy();
    });

    it('should set voided flag to false when non empty value is selected for concept attribute type', function () {
        angular.extend(patient, {
            "caste":{
                conceptUuid:"General-uuid",
                value: "General"
            }
        });


        var mappedPatientData = updatePatientRequestMapper.mapFromPatient(patientAttributeTypes, openMrsPatient,patient);

        var castePatientAttribute = _.find(mappedPatientData.patient.person.attributes ,{uuid : "caste-attribute-uuid"});
        expect(castePatientAttribute.hydratedObject).toBe("General-uuid");
    });


    it('should set voided flag to true when blank value is selected for an attribute of concept type', function () {
        angular.extend(patient, {
            "caste":{
                conceptUuid: null,
                value: "General"
            }
        });


        var mappedPatientData = updatePatientRequestMapper.mapFromPatient(patientAttributeTypes, openMrsPatient,patient);

        var castePatientAttribute = _.find(mappedPatientData.patient.person.attributes ,{uuid : "caste-attribute-uuid"});
        expect(castePatientAttribute.voided).toBeTruthy();
    });


    describe("map identifiers", function(){
        it('should filter out empty new identifier objects', function(){
            patient.identifiers = [
                {
                    uuid: "some-uuid",
                    identifier: "some-value",
                    identifierType: {
                        uuid: "identifier-type1-uuid"
                    },
                    preferred: true,
                    voided: false
                },
                {
                    identifier: "some-other-value",
                    identifierType: {
                        uuid: "identifier-type2-uuid"
                    },
                    preferred: false,
                    voided: false
                },
                {
                    identifierType: {
                        uuid: "identifier-type3-uuid"
                    }
                }
            ];

            var mappedPatientData = updatePatientRequestMapper.mapFromPatient(patientAttributeTypes, openMrsPatient,patient);

            expect(mappedPatientData.patient.identifiers.length).toBe(2);

            var mappedPatientIdentifiers = mappedPatientData.patient.identifiers;
            expect(mappedPatientIdentifiers[0].uuid).toBe("some-uuid");
            expect(mappedPatientIdentifiers[0].identifier).toBe("some-value");
            expect(mappedPatientIdentifiers[0].voided).toBeFalsy();
            expect(mappedPatientIdentifiers[0].preferred).toBeTruthy();
            expect(mappedPatientIdentifiers[0].identifierType).toBe("identifier-type1-uuid");

            expect(mappedPatientIdentifiers[1].identifier).toBe("some-other-value");
            expect(mappedPatientIdentifiers[1].uuid).toBeUndefined();
            expect(mappedPatientIdentifiers[1].voided).toBeFalsy();
            expect(mappedPatientIdentifiers[1].preferred).toBeFalsy();
            expect(mappedPatientIdentifiers[1].identifierType).toBe("identifier-type2-uuid");
        })
    })
});
