'use strict';

describe('EventLogService', function () {
    var eventLogService;

    var mockHttp = jasmine.createSpyObj('$http', ['get']);
    mockHttp.get.and.callFake(function (param) {
        return specUtil.respondWith([{uuid: 'uuid', object: '/openmrs/patient/111234'}]);
    });

    beforeEach(function () {
        module('bahmni.offline');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });
    });

    beforeEach(inject(['eventLogService', function (eventLogServiceInjected) {
        eventLogService = eventLogServiceInjected
    }]));

    it('should make a call to get events log for catchment number', function () {
        eventLogService.getEventsFor(111).then(function (data) {
            expect(data.length).toBe(1);
            expect(data[0]).toBe({uuid: 'uuid', object: '/openmrs/patient/111234'});
        });

        expect(mockHttp.get).toHaveBeenCalledWith('eventlogservice/getevents', {
            params: {filterBy: 111}
        });
    })
});