'use strict';

var $scope, _eventLogService, _$q, offlineCommonService, eventLogService, offlineSyncService;

describe('Offline - DashboardController', function () {

    beforeEach(function () {
        module('bahmni.common.offline');
        offlineCommonService = jasmine.createSpyObj('offlineCommonService', ['populateData', 'createPatient']);
        module(function ($provide) {
            $provide.value('offlineCommonService', offlineCommonService);
        });
    });

    beforeEach(inject(['offlineSyncService', '$q', 'eventLogService', function (offlineSyncServiceInjected, $q, eventLogServiceInjected) {
        offlineSyncService = offlineSyncServiceInjected;
        _$q = $q;
        eventLogService = eventLogServiceInjected;
    }]));

    describe('sync', function () {
        it('should get all events by catchment number and save', function () {
            var promiseForGetEvents = _$q.defer();
            spyOn(eventLogService, 'getEventsFor').and.returnValue(promiseForGetEvents.promise);
            promiseForGetEvents.resolve({data: [{object: 'url to get patient object', category: 'patient'}]});

            offlineSyncService.sync();

            expect(eventLogService.getEventsFor).toHaveBeenCalledWith(202020);
            expect(eventLogService.getEventsFor.calls.count()).toBe(1);
        });
    })

});