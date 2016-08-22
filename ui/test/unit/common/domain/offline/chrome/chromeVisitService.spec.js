'use strict';

describe('visitService', function () {
    var offlineDbService, visitService;
    var $q = Q;

    beforeEach(function () {
        module('bahmni.common.domain');
        module('bahmni.common.offline');
        module(function ($provide) {
            offlineDbService = jasmine.createSpyObj('offlineDbService', ['getVisitDetailsByPatientUuid']);
            $provide.value('$q', $q);
            $provide.value('offlineDbService', offlineDbService);
        });
    });

    beforeEach(inject(['visitService','offlineDbService', function (visitServiceInjected,offlineDbServiceInjected) {
        visitService = visitServiceInjected;
        offlineDbService = offlineDbServiceInjected;
    }]));

    it('should fetch visits for a given patient UUID', function (done) {
        offlineDbService.getVisitDetailsByPatientUuid.and.returnValue(specUtil.respondWithPromise($q, [
            {uuid: 1},
            {uuid: 2},
            {uuid: 3}
        ]));

        visitService.search({patient: "patientUuid"}).then(function (results) {
            expect(results.data.results.length).toBe(3);
            done();
        });
    });
});
