'use strict';

describe("Patient", function(){
    var patientModule, dateModule, patient;
    beforeEach(module('resources.patient'));
    beforeEach(inject(['patient', 'date',function(patient, date){
        patientModule = patient;
        dateModule = date;
    }]));

    describe("calculateAge", function(){
        beforeEach(function(){
            patient = patientModule.create();
            spyOn(dateModule, 'now').andReturn(new Date(2013, 2, 21)); // 21st March 2013
        });

        it("should update age when birth month is after current month", function(){
            patient.birthdate = "25-06-1980";
            patient.calculateAge();

            expect(patient.age).toBe(32);
        });

        it("should update age when birth month is before current month", function(){
            patient.birthdate = "25-02-1980";
            patient.calculateAge();

            expect(patient.age).toBe(33);
        });

        it("should reset age when birthdate is not available", function(){
            patient.birthdate = null;

            patient.calculateAge();

            expect(patient.age).toBe(null);
        });
    });

    describe("clearRegistrationNumber", function(){
        it("should clear registrationNumber and patientIdentifier", function(){
            patient.registrationNumber = "1234";
            patient.patientIdentifier = "GAN1234";

            patient.clearRegistrationNumber();

            expect(patient.registrationNumber).toBe(null);
            expect(patient.patientIdentifier).toBe(null);
        });
    });
});