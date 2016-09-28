'use strict';

describe("androidLabOrderResultsService", function () {
    var androidLabOrderResultsService, androidDbService;

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function ($provide) {
        androidDbService = jasmine.createSpyObj('androidDbService', ['getLabOrderResultsForPatient']);
        $provide.value('androidDbService', androidDbService);
        $provide.value('$q', Q);
    }));

    beforeEach(inject(['offlineLabOrderResultsService', function (androidLabOrderResultsServiceInjected) {
        androidLabOrderResultsService = androidLabOrderResultsServiceInjected;
    }]));

    describe("getAllForPatient", function () {
        var params = {
            patientUuid: "123"
        };

        it("should fetch all Lab orders for a Patient Uuid which exists", function (done) {
            androidDbService.getLabOrderResultsForPatient.and.callFake(function (patientUuid) {
                return specUtil.respondWith({
                    results: {
                        "results": ["result1", "result2"],
                        "tabularResult": {"dates": [], "orders": [], "values": []}
                    }
                });
            });

            androidLabOrderResultsService.getLabOrderResultsForPatient(params).then(function (results) {
                expect(results.data.results.length).toBe(2);
                done();
            });
        });

        it("should not fetch all Lab orders for a Patient Uuid which doesn't exists", function (done) {
            androidDbService.getLabOrderResultsForPatient.and.callFake(function (patientUuid) {
                return specUtil.respondWith({
                    results: {
                        "results": [],
                        "tabularResult": {"dates": [], "orders": [], "values": []}
                    }
                });
            });

            androidLabOrderResultsService.getLabOrderResultsForPatient(params).then(function (results) {
                expect(results.data.results.length).toBe(0);
                done();
            });
        });
    });
});
