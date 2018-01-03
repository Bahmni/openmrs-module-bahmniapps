'use strict';

describe('OpenmrsPatientMapper', function () {

    var mapper, openmrsPatient, ageModule, patientConfiguration, date = new Date(), identifiersMock,
        identifierDetails, primaryIdentifier, extraIdentifiers;
    var dateUtil = Bahmni.Common.Util.DateUtil;

    beforeEach(function () {
        module('bahmni.registration');
        module('bahmni.common.models');

        module(function ($provide) {
            identifiersMock = jasmine.createSpyObj('identifiers', ['mapIdentifiers', 'create']);
            primaryIdentifier = {
                uuid: 'primary-uuid',
                identifierType: {
                    primary: true,
                    uuid: "identifier-type-uuid",
                    identifierSources: [{
                        prefix: "GAN"
                    }, {
                        prefix: "SEM"
                    }]
                }
            };
            extraIdentifiers = [
                {
                    uuid: 'extra-uuid',
                    identifierType: {
                        primary: false,
                        uuid: "extra-identifier-type-uuid"
                    }
                }
            ];
            identifierDetails = {
                primaryIdentifier: primaryIdentifier,
                extraIdentifiers: extraIdentifiers
            };
            identifiersMock.mapIdentifiers.and.returnValue(identifierDetails);
            identifiersMock.create.and.returnValue(identifierDetails);
            $provide.value('identifiers', identifiersMock);
        });

        patientConfiguration = new Bahmni.Registration.PatientConfig([
                {
                    "uuid": "d3d93ab0-e796-11e2-852f-0800271c1b75",
                    "sortWeight": 2.0,
                    "name": "caste",
                    "description": "Caste",
                    "format": "java.lang.String",
                    "answers": []
                },
                {
                    "uuid": "d3d93ab0-e796-11e2-852f-0800271c1999",
                    "sortWeight": 2.0,
                    "name": "date",
                    "description": "Test Date",
                    "format": "org.openmrs.util.AttributableDate"
                },
                {
                    "uuid": "d3e6dc74-e796-11e2-852f-0800271c1b75",
                    "sortWeight": 2.0,
                    "name": "class",
                    "description": "Class",
                    "format": "org.openmrs.Concept",
                    "answers": [
                        {"description": "OBC", "uuid": "4da8141e-65d6-452e-9cfe-ce813bd11d52"}
                    ]
                }
            ]
        );

        inject(['openmrsPatientMapper', '$rootScope', 'age', function (openmrsPatientMapper, $rootScope, age) {
            mapper = openmrsPatientMapper;
            $rootScope.patientConfiguration = patientConfiguration;
            ageModule = age;
        }]);

        openmrsPatient = {
            patient: {
                "uuid": "1a202b45-ffa3-42a1-9177-c718e6119cfd",
                "auditInfo": {
                    dateCreated: moment(date).format()
                },
                "identifiers": [
                    {
                        "identifier": "GAN200003",
                        "identifierType": {
                            "uuid": "identifier-type-uuid"
                        }
                    }
                ],
                "person": {
                    "gender": "F",
                    "bloodGroup": "AB+",
                    "age": 0,
                    "birthdate": moment(date).format(),
                    "birthdateEstimated": false,
                    "dead" : true,
                    "causeOfDeath" : {
                      "conceptUuid": "123"
                    },
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
                            "value": "some-class",
                            "attributeType": {
                                "uuid": "d3d93ab0-e796-11e2-852f-0800271c1b75"
                            }
                        },
                        {
                            "uuid": "2a71ee67-3446-4f66-8267-82446bda2999",
                            "value": "1998-12-31T18:30:00.000+0000",
                            "attributeType": {
                                "uuid": "d3d93ab0-e796-11e2-852f-0800271c1999"
                            }
                        },
                        {
                            "uuid": "3da8141e-65d6-452e-9cfe-ce813bd11d52",
                            "value": {
                                uuid: "4da8141e-65d6-452e-9cfe-ce813bd11d52",
                                display: "some-value"
                            },
                            "attributeType": {
                                "uuid": "d3e6dc74-e796-11e2-852f-0800271c1b75"
                            }
                        }
                    ],
                    "auditInfo": {
                        dateCreated: moment(date).format()
                    }
                }
            },
            "relationships": [
                {
                    "name": "relationship"
                }
            ]
        }
    });


    it('should map values from the openmrs Patient to our patient object', function () {
        var age = {years: 2, months: 3, days: 25};
        spyOn(ageModule, 'fromBirthDate').and.returnValue(age);

        var patient = mapper.map(openmrsPatient);

        expect(patient.givenName).toBe(openmrsPatient.patient.person.preferredName.givenName);
        expect(patient.familyName).toBe(openmrsPatient.patient.person.preferredName.familyName);
        expect(patient.gender).toBe(openmrsPatient.patient.person.gender);
        expect(patient.bloodGroup).toBe(openmrsPatient.patient.person.bloodGroup);
        expect(patient.age).toBe(age);
        expect(patient.address.address1).toBe(openmrsPatient.patient.person.preferredAddress.address1);
        expect(patient.address.address2).toBe(openmrsPatient.patient.person.preferredAddress.address2);
        expect(patient.address.address3).toBe(openmrsPatient.patient.person.preferredAddress.address3);
        expect(patient.address.cityVillage).toBe(openmrsPatient.patient.person.preferredAddress.cityVillage);
        expect(patient.address.countyDistrict).toBe(openmrsPatient.patient.person.preferredAddress.countyDistrict);
        expect(patient.address.stateProvince).toBe(openmrsPatient.patient.person.preferredAddress.stateProvince);
        expect(moment(patient.date).zone(0).isSame(moment("1998-12-31T18:30:00.000+0000"))).toBe(true);
        var urlParts = patient.image.split('?');
        expect(urlParts.length).toBe(2);
        expect(urlParts[0]).toBe("/openmrs/ws/rest/v1/patientImage");
        expect(urlParts[1].startsWith('patientUuid=' + openmrsPatient.patient.uuid)).toBeTruthy();
    });

    it('should map attributes from openmrsPatient to our patient object', function () {
        var patient = mapper.map(openmrsPatient);
        expect(patient.class.conceptUuid).toBe("4da8141e-65d6-452e-9cfe-ce813bd11d52");
        expect(patient.class.value).toBe("some-value");
    });

    it('should map birth date in dd-mm-yyyy format', function () {
        var date1 = new Date();
        openmrsPatient.patient.person.birthdate = moment(date1).format();
        var patient = mapper.map(openmrsPatient);
        expect(dateUtil.getDateWithoutTime(patient.birthdate)).toEqual(dateUtil.getDateWithoutTime(dateUtil.parseServerDateToDate(moment(date1).format())));
    });

    it("should not fail when birthdate is null", function () {
        openmrsPatient.patient.person.birthdate = null;
        var patient = mapper.map(openmrsPatient);
        expect(patient.birthdate).toBe(null);
    });

    it('should map registration date', function () {
        var date1 = new Date("1947-04-15T05:30:10.748+0530");
        openmrsPatient.patient.person.auditInfo.dateCreated = moment(date1).format();
        var patient = mapper.map(openmrsPatient);
        expect(patient.registrationDate.toString()).toEqual(date1.toString());
    });

    it("should populate birthdate and age if birthdate is not estimated", function () {
        var dob = date;
        dob.setFullYear(dob.getFullYear() - 2);
        dob.setMonth(dob.getMonth() - 3);
        dob.setDate(dob.getDate() - 25);
        openmrsPatient.patient.person.birthdate = moment(dob).format();
        openmrsPatient.patient.person.birthdateEstimated = false;
        var age = {years: 2, months: 3, days: 25};
        spyOn(ageModule, 'fromBirthDate').and.returnValue(age);

        var patient = mapper.map(openmrsPatient);

        expect(dateUtil.getDateWithoutTime(patient.birthdate)).toEqual(dateUtil.getDateWithoutTime(dateUtil.parseServerDateToDate(moment(dob).format())));
        expect(patient.age).toBe(age);
    });

    it("should not fail if preferred address is null", function () {
        openmrsPatient.patient.person.preferredAddress = null;
        mapper.map(openmrsPatient);
    });

    it("should not fail if an attribute does not exist", function () {
        openmrsPatient.patient.person.attributes.push({
            "uuid": "2a71ee67-3446-4f66-8267-82446bda21a8",
            "value": "someRandomValue",
            "attributeType": {
                "uuid": "nonExistingUuid"
            }
        });
        mapper.map(openmrsPatient);
    });

    it('should map identifiers to patient returned by identifiersFactory', function () {
        var patient = mapper.map(openmrsPatient);

        expect(patient.primaryIdentifier).toBe(primaryIdentifier);
        expect(patient.extraIdentifiers).toBe(extraIdentifiers);
    });

    it('should map relationships', function () {
        var relationships = [
            {
                "name": "relationship"
            }
        ];
        var patient = mapper.map(openmrsPatient);

        expect(patient.relationships).toEqual(relationships);
        expect(patient.hasRelationships).toBeTruthy();
    });

  it('should map patient death details', function () {
        var patient = mapper.map(openmrsPatient);

        expect(patient.dead).toBeTruthy();
        expect(patient.causeOfDeath).toEqual({
            "conceptUuid": "123"
        });
        expect(patient.isDead).toBeTruthy();
  });

});
