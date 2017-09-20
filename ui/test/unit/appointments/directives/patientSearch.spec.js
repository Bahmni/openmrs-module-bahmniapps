'use strict';

describe("Patient Search", function () {
   var patientService, appointmentService, spinner;

    beforeEach(module('bahmni.appointments', function ($provide) {
        patientService = jasmine.createSpyObj('patientService', ['search']);
    }));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope) {
        compile = $compile;
    }));
});