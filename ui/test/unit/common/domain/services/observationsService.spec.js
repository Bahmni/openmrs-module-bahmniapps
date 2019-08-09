'use strict';

describe("observationsService", function () {
    var mockBackend, observationsService;

    beforeEach(function () {
        module('bahmni.common.domain');
        inject(function (_observationsService_, $httpBackend) {
            observationsService = _observationsService_;
            mockBackend = $httpBackend
        });
    });

    describe("fetchForEncounter", function () {
        it("should fetch observations for encounter", function () {
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=concept+name&encounterUuid=encounterUuid').respond({results: ["Some data"]});

            observationsService.fetchForEncounter("encounterUuid", ["concept name"]).then(function (response) {
                expect(response.data.results.length).toBe(1);
                expect(response.data.results[0]).toBe("Some data");
            });

            mockBackend.flush();
        })
    });

    describe("fetchForPatientProgram", function () {
        it("should fetch observations for patient program", function () {
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?concept=conceptName1&concept=conceptName2&patientProgramUuid=patientProgramUuid&scope=latest').respond({results: ["latest Observation"]});

            observationsService.fetchForPatientProgram("patientProgramUuid", ["conceptName1", "conceptName2"],"latest").then(function (response) {
                expect(response.data.results.length).toBe(1);
                expect(response.data.results[0]).toBe("latest Observation");
            });

            mockBackend.flush();
        })
    });

    describe("getObsInFlowSheet", function () {
        it("should send parameters specified in call to the server when conceptSet is passed", function () {
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?' +
            'conceptNames=conceptNames&conceptSet=conceptSet&enrollment=patientProgramUuid' +
            '&groupByConcept=groupByConcept&initialCount=initialCount&latestCount=latestCount' +
            '&name=groovyExtension&numberOfVisits=numberOfVisits&orderByConcept=orderByConcept&patientUuid=patientUuid')
                .respond({results: ["Some data"]});

            observationsService.getObsInFlowSheet("patientUuid", "conceptSet", "groupByConcept", "orderByConcept", "conceptNames",
                "numberOfVisits", "initialCount", "latestCount", "groovyExtension",
                null, null, "patientProgramUuid");

            mockBackend.flush();
        });
    });

    describe("getObsInFlowSheet", function () {
        it("should send parameters specified in call to the server when formNames is passed", function () {
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?' +
                'conceptNames=conceptNames&enrollment=patientProgramUuid&formNames=formNames' +
                '&groupByConcept=groupByConcept&initialCount=initialCount&latestCount=latestCount' +
                '&name=groovyExtension&numberOfVisits=numberOfVisits&orderByConcept=orderByConcept&patientUuid=patientUuid')
                .respond({results: ["Some data"]});

            observationsService.getObsInFlowSheet("patientUuid", null, "groupByConcept", "orderByConcept", "conceptNames",
                "numberOfVisits", "initialCount", "latestCount", "groovyExtension",
                null, null, "patientProgramUuid", "formNames");

            mockBackend.flush();
        });
    });

    describe("fetch By Observation Uuid", function() {
       it ("should fetch bahmni observation by uuid", function() {
           mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations?observationUuid=observationUuid').respond({results: {uuid : "observationUuid"}});

           observationsService.getByUuid("observationUuid").then(function (response) {
               expect(response.data.results.uuid).toEqual("observationUuid");
           });

           mockBackend.flush();
       });
    });

});
