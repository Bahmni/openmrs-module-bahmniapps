'use strict';

describe('patientService', function () {
    var offlineSearchDbServiceMock,$q= Q, patientService;

    beforeEach(module('bahmni.common.patient'));
    beforeEach(module('bahmni.common.offline'));

    beforeEach(module(function ($provide) {
        offlineSearchDbServiceMock = jasmine.createSpyObj('offlineSearchDbService', ['search']);
        $provide.value('offlineSearchDbService',offlineSearchDbServiceMock);
        $provide.value('$q', $q);
        offlineSearchDbServiceMock.search.and.returnValue(specUtil.respondWithPromise($q,{data: {name: 'some'}}));
    }));

    beforeEach(inject(function  (_patientService_) {
        patientService = _patientService_;
    }));

    it('should search patients from offline database', function (done) {
        patientService.search({q: 'so'}).then(function(result) {
            expect(result.data.name).toBe("some");
            done();
        })
    });
});