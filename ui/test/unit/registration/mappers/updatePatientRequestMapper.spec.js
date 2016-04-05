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
            "caste":"General"
        });


        var mappedPatientData = updatePatientRequestMapper.mapFromPatient(patientAttributeTypes, openMrsPatient,patient);

        var castePatientAttribute = _.find(mappedPatientData.patient.person.attributes ,{uuid : "caste-attribute-uuid"});
        expect(castePatientAttribute.hydratedObject).toBe("General");
    });





});
