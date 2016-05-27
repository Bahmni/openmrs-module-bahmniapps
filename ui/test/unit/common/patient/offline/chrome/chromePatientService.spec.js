'use strict';

describe('patientService', function () {
    var offlineSearchDbServiceMock, $q = Q, patientService, offlineDbServiceMock;

    beforeEach(module('bahmni.common.patient'));
    beforeEach(module('bahmni.common.offline'));

    beforeEach(module(function ($provide) {
        var patient = {
            patient: {
                uuid: "patientUuid",
                person: {
                    names: [{givenName:"patientName"}],
                    preferredName: "preferredName",
                    preferredAddress: "preferredAddress",
                    addresses: [
                        "address1"
                    ]
                }
            }
        };
        offlineDbServiceMock = jasmine.createSpyObj('offlineDbService', ['getPatientByUuid']);
        offlineSearchDbServiceMock = jasmine.createSpyObj('offlineSearchDbService', ['search']);
        offlineDbServiceMock.getPatientByUuid.and.returnValue($q.when(patient));
        $provide.value('offlineSearchDbService', offlineSearchDbServiceMock);
        $provide.value('offlineDbService', offlineDbServiceMock);
        $provide.value('$q', $q);
        offlineSearchDbServiceMock.search.and.returnValue(specUtil.respondWithPromise($q, {data: {name: 'some'}}));
    }));

    beforeEach(inject(function (_patientService_) {
        patientService = _patientService_;
    }));

    it('should search patients from offline database', function (done) {
        patientService.search({q: 'so'}).then(function (result) {
            expect(result.data.name).toBe("some");
            done();
        })
    });

    it('should get Patient by uuid from offline database', function (done) {
        patientService.getPatient("patientUuid").then(function (result) {
            expect(result.data.person.names[0].givenName).toBe("patientName");
            done();
        })
    });

    it('should get patient context by patient uuid', function (done) {
        patientService.getPatientContext("patientUuid").then(function (result) {
            expect(result.data.givenName).toBe("patientName");
            done();
        })
    });

    it('should display recent patient in all tab for offline app',  function (done) {
        patientService.getRecentPatients().then(function () {
              expect(offlineSearchDbServiceMock.search).toHaveBeenCalled();
            done();
        })
    })

});