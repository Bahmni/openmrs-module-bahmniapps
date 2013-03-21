'use strict';

describe("Patient", function(){
    var patientModule;
    beforeEach(module('resources.patient'));
    beforeEach(inject(['patient', function(patient){
        patientModule = patient;
    }]));

    describe("calculateAge", function(){
        it("should update age based on birthdate", function(){
            //TODO: inject date as module. Will be done in next commit
            var patient = patientModule.create();
            patient.birthdate = "25-06-1980";

            patient.calculateAge();

            expect(patient.age).toBe(32);
        });
    });
});