'use strict';

describe('EventLogService', function () {
    var eventLogService;

    var mockHttp = jasmine.createSpyObj('$http', ['get']);

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
        var newVar = {uuid: 'uuid', object: '/openmrs/patient/111234'};
        mockHttp.get.and.callFake(function () {
            return specUtil.respondWith([newVar]);
        });

        eventLogService.getEventsFor(111).then(function (data) {
            expect(data.length).toBe(1);
            expect(data[0]).toBe(newVar);
        });

        expect(mockHttp.get).toHaveBeenCalledWith('/event-log-service/rest/eventlog/getevents', {
            params: {filterBy: 111}
        });
    });

    it('should make a call to url', function () {
        var newVar = {uuid: 'patient uuid'};
        mockHttp.get.and.callFake(function () {
            return specUtil.respondWith(newVar);
        });

        eventLogService.getDataForUrl('/openmrs/patient/111234').then(function (data) {
            expect(data).toBe(newVar);
        });

        expect(mockHttp.get).toHaveBeenCalledWith('/openmrs/patient/111234');
    })
});