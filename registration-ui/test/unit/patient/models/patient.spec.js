'use strict';

describe("Patient", function(){
    var patientFactory, ageFactory, patient;
    beforeEach(module('registration.patient.models'));
    beforeEach(inject(['patient', 'age', function(patient, age){
        patientFactory = patient;
        ageFactory = age;
    }]));

    describe("calculateAge", function(){
        beforeEach(function(){
            patient = patientFactory.create();
        });

        it("should update age as difference between dateofBirth and today in years, months and days", function(){
            patient.birthdate = "25-06-1980";
            var age = {years: 12, months: 5, days: 29};
            spyOn(ageFactory, 'fromBirthDate').andReturn(age);            

            patient.calculateAge();

            expect(patient.age).toBe(age);
            expect(ageFactory.fromBirthDate).toHaveBeenCalledWith(new Date("06/25/1980"));
        });
    });

    describe("clearRegistrationNumber", function(){
        it("should clear registrationNumber and identifier", function(){
            patient.registrationNumber = "1234";
            patient.identifier = "GAN1234";

            patient.clearRegistrationNumber();

            expect(patient.registrationNumber).toBe(null);
            expect(patient.identifier).toBe(null);
        });
    });

    describe("fullNameLocal", function(){
        it("should be combination of givenNameLocal and familyNameLocal", function(){
            patient.givenNameLocal = "राम";
            patient.familyNameLocal = "कुमार";

            expect(patient.fullNameLocal()).toBe("राम कुमार");
        });

        it("should not have extra whitespaces when there is whitespace around givenNameLocal", function(){
            patient.givenNameLocal = " राम   ";
            patient.familyNameLocal = "कुमार";

            expect(patient.fullNameLocal()).toBe("राम कुमार");
        });

        it("should not have extra whitespaces when there is whitespace around familyNameLocal", function(){
            patient.givenNameLocal = "राम";
            patient.familyNameLocal = "  कुमार ";

            expect(patient.fullNameLocal()).toBe("राम कुमार");
        });

        it("should be empty when givenNameLocal and familyNameHindi is not available", function(){
            patient.givenNameLocal = undefined;
            patient.familyNameLocal = undefined;

            expect(patient.fullNameLocal()).toBe("");
        });

        it("should be just givenNameLocal when familyNameLocal is not available", function(){
            patient.givenNameLocal = "राम";
            patient.familyNameLocal = undefined;

            expect(patient.fullNameLocal()).toBe("राम");
        });

        it("should be just familyNameLocal when givenNameLocal is not available", function(){
            patient.givenNameLocal = undefined;
            patient.familyNameLocal = "कुमार";

            expect(patient.fullNameLocal()).toBe("कुमार");
        });
    });
});