'use strict';

describe('surgicalAppointmentService', function () {
    var surgicalAppointmentService;
    var mockHttp = jasmine.createSpyObj('$http', ['get', 'post']);

    beforeEach(function () {
        module('bahmni.ot');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        inject(['surgicalAppointmentService', function (surgicalAppointmentServiceInjected) {
            surgicalAppointmentService = surgicalAppointmentServiceInjected;
        }]);
    });

    it('should retrieve providers', function (done) {
        var data = {results: [{answers: [{displayString: "sample name"}, {displayString: "sample name2"}, {displayString: "sample name3"}]}]};
        var surgeonsConcept = "FSTG, Name (s) of Surgeon 1";
        var params = {v: 'custom:(id,uuid,person:(uuid,display))'};

        mockHttp.get.and.returnValue(specUtil.respondWith(data));

        surgicalAppointmentService.getSurgeons(surgeonsConcept).then(function (response) {
            expect(response).toEqual(data);
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/provider");
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual(params);
        expect(mockHttp.get.calls.mostRecent().args[1].method).toEqual("GET");
        expect(mockHttp.get.calls.mostRecent().args[1].withCredentials).toBeTruthy();
    });

    it('should save providers', function (done) {
        var data = {results: [{answers: [{displayString: "sample name"}, {displayString: "sample name2"}, {displayString: "sample name3"}]}]};
        var headers = {"Accept": "application/json", "Content-Type": "application/json"};
        var params = {v: 'full'};
        var surgicalBlock = {location : {uuid: "123"}, provider : {uuid: "234"}, endDatetime : "2017-09-09T11:30:00Z", startDatetime : "2017-09-09T12:30:00Z"};

        mockHttp.post.and.returnValue(specUtil.respondWith(data));

        surgicalAppointmentService.saveSurgicalBlock(surgicalBlock).then(function (response) {
            expect(response).toEqual(data);
            done();
        });
        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/surgicalBlock");
        expect(mockHttp.post.calls.mostRecent().args[1]).toEqual(surgicalBlock);
        expect(mockHttp.post.calls.mostRecent().args[2].params).toEqual(params);
        expect(mockHttp.post.calls.mostRecent().args[2].withCredentials).toBeTruthy();
        expect(mockHttp.post.calls.mostRecent().args[2].headers).toEqual(headers);
    });

});