'use strict';

describe("chromeLabOrderResultsService", function () {
    var chromeLabOrderResultsService, offlineDbService;

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function ($provide) {
        offlineDbService = jasmine.createSpyObj('offlineDbService', ['getLabOrderResultsForPatient']);
        $provide.value('offlineDbService', offlineDbService);
        $provide.value('$q', Q);
    }));

    beforeEach(inject(['offlineLabOrderResultsService', function (chromeLabOrderResultsServiceInjected) {
        chromeLabOrderResultsService = chromeLabOrderResultsServiceInjected;
    }]));

    describe("getAllForPatient", function () {
        var params = {
            patientUuid: "123"
        };

        it("should fetch all Lab orders for a Patient Uuid which exists", function (done) {
            offlineDbService.getLabOrderResultsForPatient.and.callFake(function (patientUuid) {
                return specUtil.respondWith({
                    results: {
                        "results": ["result1", "result2"],
                        "tabularResult": {"dates": [], "orders": [], "values": []}
                    }
                });
            });

            chromeLabOrderResultsService.getLabOrderResultsForPatient(params).then(function (results) {
                expect(results.data.results.length).toBe(2);
                done();
            });
        });

        it("should not fetch all Lab orders for a Patient Uuid which doesn't exists", function (done) {
            offlineDbService.getLabOrderResultsForPatient.and.callFake(function (patientUuid) {
                return specUtil.respondWith({
                    results: {
                        "results": [],
                        "tabularResult": {"dates": [], "orders": [], "values": []}
                    }
                });
            });

            chromeLabOrderResultsService.getLabOrderResultsForPatient(params).then(function (results) {
                expect(results.data.results.length).toBe(0);
                done();
            });
        });
    });
});
