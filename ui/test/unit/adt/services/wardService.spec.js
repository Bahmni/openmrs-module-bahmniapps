'use strict';

describe('Ward Service', function () {
    var wardService;
    var mockHttp = jasmine.createSpyObj('$http', ['get']);
    mockHttp.get.and.callFake(function(param) {
        return specUtil.respondWith("success");
    });

    beforeEach(function () {
        module('bahmni.adt');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        inject(['wardService', function (wardServiceInjected) {
            wardService = wardServiceInjected;
        }]);
    });

    it('service should retrieve beds for ward', function (done) {
        wardService.bedsForWard("some ward uuid").then(function(response) {
            expect(response).toEqual("success");
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/admissionLocation/some ward uuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual({v:"full"});
    });


    it('service should get wards list', function (done) {
        wardService.getWardsList().then(function(response) {
            expect(response).toEqual("success");
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/admissionLocation/");
    });
});