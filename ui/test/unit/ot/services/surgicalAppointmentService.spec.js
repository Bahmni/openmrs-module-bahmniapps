'use strict';

describe('surgicalAppointmentService', function () {
    var surgicalAppointmentService;
    var mockHttp = jasmine.createSpyObj('$http', ['get']);

    beforeEach(function () {
        module('bahmni.ot');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        inject(['surgicalAppointmentService', function (surgicalAppointmentServiceInjected) {
            surgicalAppointmentService = surgicalAppointmentServiceInjected;
        }]);
    });

    iit('service should retrieve surgeon names', function (done) {
        var data = {results: [{answers: [{displayString: "sample name"}, {displayString: "sample name2"}, {displayString: "sample name3"}]}]};
        var surgeonsConcept = "FSTG, Name (s) of Surgeon 1";
        var params = {name : surgeonsConcept, v: 'bahmni', locale: 'en'};

        mockHttp.get.and.returnValue(specUtil.respondWith(data));

        surgicalAppointmentService.getSurgeons(surgeonsConcept).then(function (response) {
            expect(response).toEqual(data);
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName");
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual(params);
        expect(mockHttp.get.calls.mostRecent().args[1].method).toEqual("GET");
        expect(mockHttp.get.calls.mostRecent().args[1].withCredentials).toBeTruthy();
    });

});