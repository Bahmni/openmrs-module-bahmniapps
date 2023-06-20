'use strict';

describe('patientService', function () {
    var rootScope, mockBackend, patientService, sessionService, appService;

    beforeEach(function () {
        module('bahmni.common.patient');
        module(function($provide) {
            sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
            $provide.value('sessionService', sessionService);
            appService = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            $provide.value('appService', appService);
        });

        inject(function (_$rootScope_, _patientService_, $httpBackend) {
            rootScope = _$rootScope_;
            patientService = _patientService_;
            mockBackend = $httpBackend
        });
    });

    describe('getPatientContext', function () {
        it('should make http call to get patient context', function () {
            var patientUuid = 'patientUuid';
            var programUuid = 'programUuid';
            var personAttributes = [];
            var programAttributes = [];
            var patientIdentifiers = [];
            var results = {};
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/patientcontext?patientUuid=patientUuid&programUuid=programUuid').respond({results: results});

            patientService.getPatientContext(patientUuid, programUuid, personAttributes, programAttributes, patientIdentifiers).then(function (response) {
                expect(response.data.results).toEqual(results);
            });

            mockBackend.flush();
        });
    })
});