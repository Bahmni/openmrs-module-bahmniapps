'use strict';

describe('Query Service', function () {
    var queryService;
    var mockHttp = jasmine.createSpyObj('$http', ['get']);
    mockHttp.get.and.callFake(function(param) {
        return specUtil.respondWith("success");
    });

    beforeEach(function () {
        module('bahmni.adt');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        inject(['queryService', function (queryServiceInjected) {
            queryService = queryServiceInjected;
        }]);
    });

    it('service should retrieve', function (done) {
        queryService.getResponseFromQuery("someParams").then(function(response) {
            expect(response).toEqual("success");
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/bahmnicore/sql");
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual("someParams");
    });
});