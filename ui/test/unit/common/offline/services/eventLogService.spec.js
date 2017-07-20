'use strict';

describe('EventLogService', function () {
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
            return specUtil.respondWith({"events":[newVar], "pendingEventsCount":1});
        });

        eventLogService.getEventsFor('transactionalData',{ filters: [111]}).then(function (data) {
            expect(data["events"].length).toBe(1);
            expect(data["events"][0]).toBe(newVar);
            expect(data["pendingEventsCount"]).toBe(1);
        });

        expect(mockHttp.get).toHaveBeenCalledWith('/event-log-service/rest/eventlog/events', {
            params: {filterBy: [111], uuid: undefined}
        });
    });

    it('should make a call to get offline-concepts for catchment number', function () {
        var newVar = {uuid: 'uuid', object: '/openmrs/concept/111234'};
        mockHttp.get.and.callFake(function () {
            return specUtil.respondWith({"events":[newVar], "pendingEventsCount":1});
        });

        eventLogService.getEventsFor('offline-concepts',{ filters: []}).then(function (data) {
            expect(data["events"].length).toBe(1);
            expect(data["events"][0]).toBe(newVar);
            expect(data["pendingEventsCount"]).toBe(1);
        });

        expect(mockHttp.get).toHaveBeenCalledWith('/event-log-service/rest/eventlog/concepts', {
            params: {filterBy: [], uuid: undefined}
        });
    });

    it('should make a call to get AddressHierarchy for catchment number', function () {
        var newVar = {uuid: 'uuid', object: '/openmrs/addressHierarchy/111234'};
        mockHttp.get.and.callFake(function () {
            return specUtil.respondWith({"events":[newVar], "pendingEventsCount":1});
        });

        eventLogService.getEventsFor('addressHierarchy',{ filters: []}).then(function (data) {
            expect(data["events"].length).toBe(1);
            expect(data["events"][0]).toBe(newVar);
            expect(data["pendingEventsCount"]).toBe(1)
        });

        expect(mockHttp.get).toHaveBeenCalledWith('/event-log-service/rest/eventlog/getAddressHierarchyEvents', {
            params: {filterBy: [], uuid: undefined}
        });
    });

    it('should make a call to get ParentAddressHierarchy for catchment number', function () {
        var newVar = {uuid: 'uuid', object: '/openmrs/addressHierarchy/111234'};
        mockHttp.get.and.callFake(function () {
            return specUtil.respondWith({"events":[newVar], "pendingEventsCount":1});
        });

        eventLogService.getEventsFor('parentAddressHierarchy',{ filters: []}).then(function (data) {
            expect(data["events"].length).toBe(1);
            expect(data["events"][0]).toBe(newVar);
            expect(data["pendingEventsCount"]).toBe(1);
        });

        expect(mockHttp.get).toHaveBeenCalledWith('/event-log-service/rest/eventlog/getAddressHierarchyEvents', {
            params: {filterBy: [], uuid: undefined}
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

    it('should call event log filter URL to get filters for all categories for the given login  location, address and provider ', function () {
        var newVar = [{category:"addressHierarchy" , filters:[]}, {category:"transactionalData" , filters:["123", "456"]}, {category:"offline-concepts" , filters:[]}];
        mockHttp.get.and.callFake(function () {
            return specUtil.respondWith(newVar);
        });

        eventLogService.getFilterForCategoryAndLoginLocation("providerUuid", "addressUuid", "loginLocationUuid").then(function (data) {
            expect(data).toBe(newVar);
        });

        expect(mockHttp.get).toHaveBeenCalledWith("/openmrs/ws/rest/v1/eventlog/filter/markers/providerUuid/addressUuid/loginLocationUuid", {method: "GET", withCredentials: true});
    });


});
