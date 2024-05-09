'use strict';

describe('patientService', function () {
    var rootScope, mockBackend, patientService, sessionService, appService;

    beforeEach(function () {
        module('bahmni.common.patient');
        module(function($provide) {
            sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
            sessionService.getLoginLocationUuid.and.returnValue("loginLocationUuid");
            $provide.value('sessionService', sessionService);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
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

    describe('luceneSearch', function () {
        it('should make http call to lucene search api', function () {
            var q = 'test';
            var startIndex = 0;
            var identifier = 'identifier';
            var customAttribute = 'customAttribute';
            var searchParams = {
                filterOnAllIdentifiers: true,
                q: q,
                startIndex: startIndex,
                identifier: identifier,
                loginLocationUuid: sessionService.getLoginLocationUuid(),
                patientSearchResultsConfig: customAttribute
            }
            var results = {};
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmni/search/patient/lucene?filterOnAllIdentifiers=true&identifier=identifier&loginLocationUuid=loginLocationUuid&patientSearchResultsConfig=customAttribute&q=test&startIndex=0').respond({results: results});

            patientService.search(q, customAttribute, startIndex, identifier).then(function (response) {
                expect(response.data.results).toEqual(results);
            });

            mockBackend.flush();
        });
    })
});