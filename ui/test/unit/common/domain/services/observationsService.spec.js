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
    })
});