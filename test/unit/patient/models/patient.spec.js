'use strict';

describe("Patient", function(){
    var patientFactory, ageFactory, patient;
    beforeEach(module('registration.patient.models'));
    beforeEach(inject(['patient', 'date', 'age', function(patient, date, age){
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

    describe("fullNameHindi", function(){
        it("should be combination of givenNameHindi and familyNameHindi", function(){
            patient.givenNameHindi = "राम";
            patient.familyNameHindi = "कुमार";

            expect(patient.fullNameHindi()).toBe("राम कुमार");
        });

        it("should not have extra whitespaces when there is whitespace around givenNameHindi", function(){
            patient.givenNameHindi = " राम   ";
            patient.familyNameHindi = "कुमार";

            expect(patient.fullNameHindi()).toBe("राम कुमार");
        });

        it("should not have extra whitespaces when there is whitespace around familyNameHindi", function(){
            patient.givenNameHindi = "राम";
            patient.familyNameHindi = "  कुमार ";

            expect(patient.fullNameHindi()).toBe("राम कुमार");
        });

        it("should be empty when givenNameHindi and familyNameHindi is not available", function(){
            patient.givenNameHindi = undefined;
            patient.familyNameHindi = undefined;

            expect(patient.fullNameHindi()).toBe("");
        });

        it("should be just givenNameHindi when familyNameHindi is not available", function(){
            patient.givenNameHindi = "राम";
            patient.familyNameHindi = undefined;

            expect(patient.fullNameHindi()).toBe("राम");
        });

        it("should be just familyNameHindi when givenNameHindi is not available", function(){
            patient.givenNameHindi = undefined;
            patient.familyNameHindi = "कुमार";

            expect(patient.fullNameHindi()).toBe("कुमार");
        });
    });
});