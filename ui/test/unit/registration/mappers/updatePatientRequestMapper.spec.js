'use strict';

describe('UpdatePatientRequestMapper', function () {

    var patient;
    var patientAttributeTypes, identifiersMock, identifierDetails;
    var date = new Date();
    var updatePatientRequestMapper = new Bahmni.Registration.UpdatePatientRequestMapper();
    var openMrsPatient;

    beforeEach(function () {
        module('bahmni.registration');
        module('bahmni.common.models');
        module(function ($provide) {
            identifiersMock = jasmine.createSpyObj('identifiers', ['create']);
            identifierDetails = {
                primaryIdentifier: {
                    identifierType: {
                        primary: true,
                        uuid: "identifier-type-uuid",
                        identifierSources: [{
                            prefix: "GAN",
                            uuid: 'dead-cafe'
                        }, {
                            prefix: "SEM",
                            uuid: 'new-cafe'
                        }]
                    }
                },
                extraIdentifiers: [{
                    identifierType: {
                        uuid: 'extra-identifier-type-uuid',
                        primary: false
                    }
                }]
            };
            identifiersMock.create.and.returnValue(identifierDetails);

            $provide.value('identifiers', identifiersMock);

        });
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
                    {"description": "OBC", "conceptId": "10"},
                    {"description": "General", "conceptId": "11"}
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
            "isUrban": false,
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
                attributes: [{
                    attributeType: {
                        uuid: "caste-uuid",
                        display: "caste"

                    },

                    uuid: "caste-attribute-uuid",

                    value: {
                        uuid: "11",
                        display: "General"
                    }
                }]
            }
        };

    });


    it('should set voided flag when Empty value is selected for concept attribute type(dropdown)', function () {

        var mappedPatientData = updatePatientRequestMapper.mapFromPatient(patientAttributeTypes, openMrsPatient, patient);

        var castePatientAttribute = _.find(mappedPatientData.patient.person.attributes, {uuid: "caste-attribute-uuid"})
        expect(castePatientAttribute.voided).toBeTruthy();
    });

    it('should set voided flag to false when non empty value is selected for concept attribute type', function () {
        angular.extend(patient, {
            "caste": {
                conceptUuid: "General-uuid",
                value: "General"
            }
        });


        var mappedPatientData = updatePatientRequestMapper.mapFromPatient(patientAttributeTypes, openMrsPatient, patient);

        var castePatientAttribute = _.find(mappedPatientData.patient.person.attributes, {uuid: "caste-attribute-uuid"});
        expect(castePatientAttribute.hydratedObject).toBe("General-uuid");
    });


    it('should set voided flag to true when blank value is selected for an attribute of concept type', function () {
        angular.extend(patient, {
            "caste": {
                conceptUuid: null,
                value: "General"
            }
        });


        var mappedPatientData = updatePatientRequestMapper.mapFromPatient(patientAttributeTypes, openMrsPatient, patient);

        var castePatientAttribute = _.find(mappedPatientData.patient.person.attributes, {uuid: "caste-attribute-uuid"});
        expect(castePatientAttribute.voided).toBeTruthy();
    });


    describe("map identifiers", function () {
        it('should filter out empty new identifier objects', function () {
            var identifiers = [
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

            patient.primaryIdentifier = new Bahmni.Registration.Identifier({uuid: 'identifier-type1-uuid'}).map(identifiers);
            patient.extraIdentifiers = [new Bahmni.Registration.Identifier({uuid: 'identifier-type2-uuid'}).map(identifiers),
                new Bahmni.Registration.Identifier({uuid: 'identifier-type3-uuid'}).map(identifiers)];

            var mappedPatientData = updatePatientRequestMapper.mapFromPatient(patientAttributeTypes, openMrsPatient, patient);

            expect(mappedPatientData.patient.identifiers.length).toBe(2);

            var mappedPatientIdentifiers = mappedPatientData.patient.identifiers;
            expect(mappedPatientIdentifiers).toContain({
                uuid: "some-uuid",
                identifier: "some-value",
                voided: false,
                preferred: true,
                identifierType: "identifier-type1-uuid"
            });

            expect(mappedPatientIdentifiers).toContain({
                uuid: undefined,
                identifier: "some-other-value",
                voided: false,
                preferred: false,
                identifierType: "identifier-type2-uuid"
            });

            })
    })
});
