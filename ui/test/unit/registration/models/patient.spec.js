'use strict';

describe("Patient", function () {
    var patientFactory, ageFactory, patient;
    beforeEach(module('bahmni.registration'));
    beforeEach(module('bahmni.common.models'));
    var identifiersFactoryMock = jasmine.createSpyObj('identifiers', ['create']);
    beforeEach(module(function ($provide) {
        $provide.value('identifiers', identifiersFactoryMock);
    }));
    beforeEach(inject(['patient', 'age', function (patient, age) {
        patientFactory = patient;
        ageFactory = age;
    }]));
    beforeEach(function () {
        patient = patientFactory.create();
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


    describe('create identifiers', function () {
        it('should assign identifiers created by identifiers factory to patient', function(){
            var primaryIdentifier = new Bahmni.Registration.Identifier({uuid: 'primary-identifier-type-uuid'});
            var extraIdentifier1 = new Bahmni.Registration.Identifier({uuid: 'extra1-identifier-type-uuid'});
            var extraIdentifier2 = new Bahmni.Registration.Identifier({uuid: 'extra2-identifier-type-uuid'});
            identifiersFactoryMock.create.and.returnValue({
                primaryIdentifier: primaryIdentifier,
                extraIdentifiers: [extraIdentifier1, extraIdentifier2],
                identifiers: [primaryIdentifier, extraIdentifier1, extraIdentifier2]
            });

            patient = patientFactory.create();

            expect(patient.identifiers.length).toBe(3);
            expect(patient.extraIdentifiers.length).toBe(2);
            expect(patient.extraIdentifiers).toEqual([extraIdentifier1, extraIdentifier2]);
            expect(patient.primaryIdentifier).toBe(primaryIdentifier);

        });
    });
});