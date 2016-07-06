'use strict';

describe('Registration Visit Service', function () {
    var visitService;
    var openmrsVisitUrl = "/openmrs/ws/rest/v1/visit";
    var endVisitUrl = "/openmrs/ws/rest/v1/endVisit";
    var endVisitAndCreateEncounterUrl = "/openmrs/ws/rest/v1/bahmnicore/visit/endVisitAndCreateEncounter";
    var uuid = "9e23a1bb-0615-4066-97b6-db309c9c6447";

    var mockHttp = {
        get: jasmine.createSpy('Http get').and.returnValue({'results': [{'uuid': uuid}]}),
        post: jasmine.createSpy('Http post').and.returnValue({
            'success': function () {
                return {
                    'then': function (thenMethod) {
                        thenMethod()
                    },
                    'error': function (onError) {
                        onError()
                    }
                }
            }
        })
    };

    beforeEach(function () {
        module('bahmni.common.domain');
        module(function ($provide) {
            Bahmni.Common.Constants.endVisitUrl = endVisitUrl;
            Bahmni.Common.Constants.visitUrl = openmrsVisitUrl;
            $provide.value('$http', mockHttp);
        });

        inject(['visitService', function (visitServiceInjectted) {
            visitService = visitServiceInjectted;
        }]);
    });

    it('Should call search url in registration visit service', function () {
        var parameters = {patient: uuid, includeInactive: false, v: "custom:(uuid)"};

        visitService.search(parameters);

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(openmrsVisitUrl);
        expect(mockHttp.get.calls.mostRecent().args[1].params.patient).toBe(uuid);
        expect(mockHttp.get.calls.mostRecent().args[1].params.includeInactive).toBeFalsy();
    });

    it('Should call end visit url in registration visit service', function () {
        visitService.endVisit(uuid);

        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.calls.mostRecent().args[0]).toBe(endVisitUrl + '?visitUuid=' + uuid);
        expect(mockHttp.post.calls.mostRecent().args[1].withCredentials).toBeTruthy();
    });

    it("Should post visit details to create visit url", function () {
        var visitDetails = {patientUuid: "uuid"};

        visitService.createVisit(visitDetails);

        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.calls.mostRecent().args[0]).toBe(openmrsVisitUrl);
        expect(mockHttp.post.calls.mostRecent().args[1]).toBe(visitDetails);
        expect(mockHttp.post.calls.mostRecent().args[2].withCredentials).toBeTruthy();
    });

    it("Should post visitUUId and bahmniEncounterTransaction to endVisitAndCreateEncounterUrl", function () {
        var bahmniEncounterTransaction = {patientUuid: "uuid",visitTypeUuid: "3232"};
        var visitUuid="1234";
        visitService.endVisitAndCreateEncounter(visitUuid,bahmniEncounterTransaction);

        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.calls.mostRecent().args[0]).toBe(endVisitAndCreateEncounterUrl+"?visitUuid="+visitUuid);
        expect(mockHttp.post.calls.mostRecent().args[1]).toBe(bahmniEncounterTransaction);
        expect(mockHttp.post.calls.mostRecent().args[2].withCredentials).toBeTruthy();
    });

});
