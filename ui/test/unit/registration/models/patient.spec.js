'use strict';

describe("Patient", function () {
    var patientFactory, ageFactory, patient;
    beforeEach(module('bahmni.registration'));
    beforeEach(module('bahmni.common.models'));
    beforeEach(inject(['patient', 'age', function (patient, age) {
        patientFactory = patient;
        ageFactory = age;
    }]));
    beforeEach(function () {
        var identifierTypes = [{
            "uuid": "81433852-3f10-11e4-adec-0800271c1b75",
            "name": "Bahmni Id",
            "format": null,
            "required": true,
            "primary": true,
            "identifierSources": [{
                "uuid": "c1e39ece-3f10-11e4-adec-0800271c1b75",
                "name": "BAM",
                "prefix": "BAH"
            }, {
                "uuid": "c1d8a345-3f10-11e4-adec-0800271c1b75",
                "name": "GAN",
                "prefix": "GAN"
            }, {
                "uuid": "c1d90956-3f10-11e4-adec-0800271c1b75",
                "name": "SEM",
                "prefix": "SEM"
            }, {"uuid": "c1dbd8bd-3f10-11e4-adec-0800271c1b75", "name": "SIV", "prefix": "SIV"}]
        }, {
            "uuid": "8d79403a-c2cc-11de-8d13-0010c6dffd0f",
            "name": "Old Identification Number",
            "format": null,
            "required": false,
            "primary": false,
            "identifierSources": []
        }];
        patient = patientFactory.create(identifierTypes);
    });


    describe("calculateAge", function () {
        it("should update age as difference between dateofBirth and today in years, months and days", function () {
            patient.birthdate = new Date("06/25/1980");
            var age = {years: 12, months: 5, days: 29};
            spyOn(ageFactory, 'fromBirthDate').and.returnValue(age);

            patient.calculateAge();

            expect(patient.age).toBe(age);
            expect(ageFactory.fromBirthDate).toHaveBeenCalledWith(new Date("06/25/1980"));
        });

        it("should update age as difference between dateofBirth and today in years, months and days", function () {
            var birthdate = new Date("06/25/1980");
            patient.age = ageFactory.create(12, 5, 29);

            spyOn(ageFactory, 'calculateBirthDate').and.returnValue(birthdate);

            patient.calculateBirthDate();

            expect(patient.birthdate).toBe(birthdate);
            expect(ageFactory.calculateBirthDate).toHaveBeenCalledWith(patient.age);
        });
    });

    describe("clearRegistrationNumber", function () {
        it("should clear registrationNumber and identifier", function () {
            patient.identifiers[0].registrationNumber = "1234";
            patient.identifiers[0].identifier = "GAN1234";

            patient.clearRegistrationNumber(patient.identifiers[0]);

            expect(patient.identifiers[0].registrationNumber).toBe(null);
            expect(patient.identifiers[0].identifier).toBe(null);
        });
    });

    describe("fullNameLocal", function () {
        it("should be combination of givenNameLocal and familyNameLocal", function () {
            patient.givenNameLocal = "राम";
            patient.familyNameLocal = "कुमार";

            expect(patient.fullNameLocal()).toBe("राम कुमार");
        });

        it("should not have extra whitespaces when there is whitespace around givenNameLocal", function () {
            patient.givenNameLocal = " राम   ";
            patient.familyNameLocal = "कुमार";

            expect(patient.fullNameLocal()).toBe("राम कुमार");
        });

        it("should not have extra whitespaces when there is whitespace around familyNameLocal", function () {
            patient.givenNameLocal = "राम";
            patient.familyNameLocal = "  कुमार ";

            expect(patient.fullNameLocal()).toBe("राम कुमार");
        });

        it("should be empty when givenNameLocal and familyNameHindi is not available", function () {
            patient.givenNameLocal = undefined;
            patient.familyNameLocal = undefined;

            expect(patient.fullNameLocal()).toBe("");
        });

        it("should be just givenNameLocal when familyNameLocal is not available", function () {
            patient.givenNameLocal = "राम";
            patient.familyNameLocal = undefined;

            expect(patient.fullNameLocal()).toBe("राम");
        });

        it("should be just familyNameLocal when givenNameLocal is not available", function () {
            patient.givenNameLocal = undefined;
            patient.familyNameLocal = "कुमार";

            expect(patient.fullNameLocal()).toBe("कुमार");
        });
    });

    describe("generateIdentifier", function () {

        it("should void the saved identifier when identifier text field is blanked out", function () {
            var identifier = {
                uuid: "some-uuid",
                voided: false,
                registrationNumber: ""
            };
            patient.generateIdentifier(identifier);

            expect(identifier.voided).toBeTruthy();
        })
    })
});