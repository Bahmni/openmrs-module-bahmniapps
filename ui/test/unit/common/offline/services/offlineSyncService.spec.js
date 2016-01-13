'use strict';

var $scope, _eventLogService, _$q, offlinePatientDao, eventLogService, offlineSyncService, offlineMarkerDao;

describe('OfflineSyncService', function () {

    beforeEach(function () {
        module('bahmni.common.offline');
        offlinePatientDao = jasmine.createSpyObj('offlinePatientDao', ['populateData', 'createPatient']);
        offlineMarkerDao = jasmine.createSpyObj('offlineMarkerDao', ['getMarker', 'insertMarker']);
        module(function ($provide) {
            $provide.value('offlinePatientDao', offlinePatientDao);
            $provide.value('offlineMarkerDao', offlineMarkerDao);
        });
    });

    beforeEach(inject(['offlineSyncService', '$q', 'eventLogService', 'offlineMarkerDao', function (offlineSyncServiceInjected, $q, eventLogServiceInjected, offlineMarkerDaoInjected) {
        offlineSyncService = offlineSyncServiceInjected;
        _$q = $q;
        eventLogService = eventLogServiceInjected;
        offlineMarkerDao = offlineMarkerDaoInjected;
    }]));

    describe('sync', function () {
        xit('should get all events by catchment number and save', function () {
            var promiseForGetMarker = _$q.defer();
            spyOn(offlineMarkerDao, 'getMarker').and.returnValue(promiseForGetMarker.promise);
            promiseForGetMarker.resolve({data: [{object: 'url to get patient object', category: 'patient'}]});

            spyOn(eventLogService, 'getEventsFor').and.returnValue(promiseForGetMarker.promise);
            offlineSyncService.sync();

            expect(offlineMarkerDao.getMarker).toHaveBeenCalledWith();
            expect(offlineMarkerDao.getMarker.calls.count()).toBe(1);
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
        });
    })

});