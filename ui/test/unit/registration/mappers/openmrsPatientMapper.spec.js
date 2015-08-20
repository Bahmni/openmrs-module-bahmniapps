'use strict';

describe('patientMapper', function () {

    var mapper, openmrsPatient, ageModule, patientConfiguration, date = new Date();

    beforeEach(function () {
        module('bahmni.registration');
        
        patientConfiguration = new Bahmni.Registration.PatientConfig([
            {"uuid": "d3d93ab0-e796-11e2-852f-0800271c1b75", "sortWeight": 2.0, "name": "caste", "description": "Caste", "format": "java.lang.String", "answers": []},
            {"uuid": "d3e6dc74-e796-11e2-852f-0800271c1b75", "sortWeight": 2.0, "name": "class", "description": "Class", "format": "org.openmrs.Concept",
                "answers": [
                    {"description": "OBC", "uuid": "4da8141e-65d6-452e-9cfe-ce813bd11d52"}
                ]}
        ]);

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
                    "identifier": "GAN200003"
                }
            ],
            "person": {
                "gender": "F",
                "bloodGroup": "AB+",
                "age": 0,
                "birthdate": moment(date).format(),
                "birthdateEstimated": false,
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
                    } ,
                    {
                        "uuid": "3da8141e-65d6-452e-9cfe-ce813bd11d52",
                        "value":  {
                            uuid : "4da8141e-65d6-452e-9cfe-ce813bd11d52"
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
        }}
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
        expect(patient.identifier).toBe(openmrsPatient.patient.identifiers[0].identifier);
        expect(patient.address.address1).toBe(openmrsPatient.patient.person.preferredAddress.address1);
        expect(patient.address.address2).toBe(openmrsPatient.patient.person.preferredAddress.address2);
        expect(patient.address.address3).toBe(openmrsPatient.patient.person.preferredAddress.address3);
        expect(patient.address.cityVillage).toBe(openmrsPatient.patient.person.preferredAddress.cityVillage);
        expect(patient.address.countyDistrict).toBe(openmrsPatient.patient.person.preferredAddress.countyDistrict);
        expect(patient.address.stateProvince).toBe(openmrsPatient.patient.person.preferredAddress.stateProvince);
        var urlParts = patient.image.split('?');
        expect(urlParts.length).toBe(2);
        expect(urlParts[0]).toBe("/patient_images/" + openmrsPatient.patient.uuid + ".jpeg");
    });

    it('should map attributes from openmrsPatient to our patient object', function () {
        var patient = mapper.map(openmrsPatient);
        expect(patient.class).toBe("4da8141e-65d6-452e-9cfe-ce813bd11d52");
    });

    it('should map birth date in dd-mm-yyyy format', function () {
        var date1 = new Date();
        date1.setHours(0,0,0,0);
        openmrsPatient.patient.person.birthdate = moment(date1).format();
        var patient = mapper.map(openmrsPatient);
        expect(patient.birthdate).toEqual(new Date(moment(date1).format()));
    });

    it("should not fail when birthdate is null", function () {
        openmrsPatient.patient.person.birthdate = null;
        var patient = mapper.map(openmrsPatient);
        expect(patient.birthdate).toBe(null);
    });

    it('should map registration date', function () {
        var date1 = new Date();
        openmrsPatient.patient.person.personDateCreated = moment(date1).format();
        var patient = mapper.map(openmrsPatient);
        expect(patient.registrationDate).toEqual(new Date(moment(date).format()));
    });

    it("should populate birthdate and age if birthdate is not estimated", function () {
        var dob = date;
        dob.setFullYear(dob.getFullYear()-2);
        dob.setMonth(dob.getMonth()-3);
        dob.setDate(dob.getDate()-25);
        openmrsPatient.patient.person.birthdate = moment(dob).format();
        openmrsPatient.patient.person.birthdateEstimated = false;
        var age = {years: 2, months: 3, days: 25};
        spyOn(ageModule, 'fromBirthDate').and.returnValue(age);

        var patient = mapper.map(openmrsPatient);

        expect(patient.birthdate).toEqual(new Date(moment(dob).format()));
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
});
