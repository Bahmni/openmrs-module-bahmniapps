'use strict';

ddescribe('EventLogService', function () {
    var eventLogService;

    var mockHttp = jasmine.createSpyObj('$http', ['get']);

    beforeEach(function () {
        module('bahmni.common.offline');
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

        expect(mockHttp.get).toHaveBeenCalledWith('/event-log-service/rest/eventlog/events', {
            params: {filterBy: 111, uuid: undefined}
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
    });

    it('should make a call to get address for login location', function (done) {
        var result = [
            {
                "name": "Kaliganj Paurasava",
                "uuid": "7abec0b0-e89e-40cb-8ed1-da47747be9eb",
                "userGeneratedId": "40443332",
                "parent": {
                    "name": "Kaliganj",
                    "uuid": "5a93f0e8-dc3d-4c9b-88a7-aa7be764f7a6",
                    "userGeneratedId": "404433"
                }
            },
            {
                "name": "Kaliganj Paurashava",
                "uuid": "ea664f90-7483-4bcd-ae7a-9e223cee5e4b",
                "userGeneratedId": "30333449",
                "parent": {
                    "name": "Kaliganj",
                    "uuid": "89471bee-1bbe-47eb-b1a9-6cf3093b1452",
                    "userGeneratedId": "303334"
                }
            }
        ];
        var params =  {searchString: 'location', addressField: "address2"};
        mockHttp.get.and.callFake(function () {
            return specUtil.respondWith(result);
        });

        eventLogService.getAddressForLoginLocation(params).then(function (data) {
            expect(data.length).toBe(2);
            expect(data).toBe(result);
            done();
        });

        expect(mockHttp.get).toHaveBeenCalledWith('/openmrs/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form', {
            method : 'GET',
            params: params,
            withCredentials : true
        });
    });


});