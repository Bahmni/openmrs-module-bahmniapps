'use strict';

describe('offlineEncounterService', function () {

    var encounterService, offlineEncounterServiceStrategy, eventQueue;
    var $q= Q;
    var rootScope, $bahmniCookieStore;
    var encounterJson;

    beforeEach(module('bahmni.common.offline'));
    beforeEach(module('bahmni.common.domain'));

    beforeEach(module(function ($provide) {
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        encounterJson = JSON.parse(readFixtures('encounter.json'));
        var encounterProvider = {value: "Test", uuid: "Test_UUID"};

        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get']);
        $bahmniCookieStore.get.and.callFake(function (cookie) {
            if (cookie == Bahmni.Common.Constants.grantProviderAccessDataCookieName) {
                return encounterProvider;
            }
            if (cookie == Bahmni.Common.Constants.locationCookieName) {
                return {name: "location-name"};
            }
        });
        $provide.value('$q', $q);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
        $provide.value("offlineDbService", {
            getCurrentDbName: function () {
                return "location-name";
            }
        });
        $provide.value('offlineService', {
            isAndroidApp: function () {
                return false;
            },
            isOfflineApp: function () {
                return true;
            }
        })
    }));

    beforeEach(inject(['encounterService','offlineEncounterServiceStrategy', 'eventQueue', '$rootScope', function (encounterServiceInjected, offlineEncounterServiceStrategyInjected, eventQueueInjected, $rootScope) {
        encounterService = encounterServiceInjected;
        offlineEncounterServiceStrategy = offlineEncounterServiceStrategyInjected;
        eventQueue = eventQueueInjected;
        rootScope = $rootScope;
    }]));


    it('should return an empty encounter data, if there is no active encounter for given patientUuid',function (done) {
        var params = {
            patientUuid: 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11',
            providerUuid: undefined,
            encounterType: undefined
        };

        spyOn(offlineEncounterServiceStrategy, 'find').and.returnValue(specUtil.respondWithPromise($q, []));
        var result = encounterService.find(params).then(function(results){
            expect(offlineEncounterServiceStrategy.find.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.find).toHaveBeenCalledWith(params);
            expect(results.data.patientUuid).toBe(null);
            expect(results.data.patientId).toBe(null);
            expect(results.data.visitType).toBe(null);
            expect(results.data.observations).toEqual([]);
            expect(results.data.bahmniDiagnoses).toEqual([]);
            done();
        });
    });

    it('should return encounter data, if there is an active encounter for given patientUuid',function (done) {
        var params = {
            patientUuid: 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11',
            providerUuid: undefined,
            encounterType: undefined
        };

        spyOn(offlineEncounterServiceStrategy, 'find').and.returnValue(specUtil.respondWithPromise($q, {encounter: encounterJson}));
        var result = encounterService.find(params).then(function(results){
            expect(offlineEncounterServiceStrategy.find.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.find).toHaveBeenCalledWith(params);
            expect(results.data).toBe(encounterJson);
            done();
        });
    });

    it('should create an encounter with given encounterData',function (done) {
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var encounterData = JSON.parse(readFixtures('encounter.json'));

        spyOn(offlineEncounterServiceStrategy, 'getDefaultEncounterType').and.returnValue(specUtil.respondWithPromise($q, {data: "Field"}));
        spyOn(offlineEncounterServiceStrategy, 'create').and.returnValue(specUtil.respondWithPromise($q, {data: encounterData}));
        spyOn(eventQueue, 'addToEventQueue').and.returnValue(specUtil.respondWithPromise($q, {}));

        var result = encounterService.create(encounterData).then(function(results){
            expect(offlineEncounterServiceStrategy.getDefaultEncounterType.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.getDefaultEncounterType).toHaveBeenCalledWith();
            expect(results.data).not.toBeUndefined();
            expect(results.data.encounterUuid).not.toBeUndefined();
            expect(results.data.visitType).toBe("Field");
            expect(results.data.observations.length).toEqual(1);
            expect(results.data.observations[0].groupMembers).not.toBeUndefined();
            expect(results.data.observations[0].groupMembers[0].uuid).not.toBeUndefined();
            expect(results.data.observations[0].groupMembers[0].encounterUuid).not.toBeUndefined();
            expect(results.data.encounterType).toBe("FIELD");
            expect(results.data).toBe(encounterData);
            done();
        });
    });

    it('should create an encounter with given encounterData, if there is no encounter it will create an encounter of type Field, providers and encounterUuids to groupMembers',function (done) {

        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var encounterData = JSON.parse(readFixtures('encounter.json'));

        encounterData.encounterUuid = undefined;
        encounterData.visitUuid = undefined;
        encounterData.visitType = undefined;
        encounterData.encounterDateTime = undefined;
        encounterData.providers = [];
        encounterData.observations[0].groupMembers[0].encounterUuid = null;
        encounterData.encounterType  = undefined;

        spyOn(offlineEncounterServiceStrategy, 'getDefaultEncounterType').and.returnValue(specUtil.respondWithPromise($q, {data: "FieldEncounter"}));
        spyOn(offlineEncounterServiceStrategy, 'create').and.returnValue(specUtil.respondWithPromise($q, {data: encounterData}));
        spyOn(eventQueue, 'addToEventQueue').and.returnValue(specUtil.respondWithPromise($q, {}));

        var result = encounterService.create(encounterData).then(function(results){
            expect(offlineEncounterServiceStrategy.getDefaultEncounterType.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.getDefaultEncounterType).toHaveBeenCalledWith();
            expect(offlineEncounterServiceStrategy.create.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.create).toHaveBeenCalledWith(encounterData);
            expect(eventQueue.addToEventQueue.calls.count()).toBe(1);
            expect(eventQueue.addToEventQueue).toHaveBeenCalledWith({type: "encounter", encounterUuid: results.data.encounterUuid, dbName: "location-name"});

            expect(results.data).not.toBeUndefined();
            expect(results.data.encounterUuid).not.toBeUndefined();
            expect(results.data.visitUuid).toBe(null);
            expect(results.data.visitType).toBe("Field");
            expect(results.data.encounterDateTime).not.toBeUndefined();
            expect(results.data.providers).toEqual([{uuid: "Test_UUID"}]);
            expect(results.data.observations.length).toEqual(1);
            expect(results.data.observations[0].groupMembers).not.toBeUndefined();
            expect(results.data.observations[0].groupMembers[0].uuid).not.toBeUndefined();
            expect(results.data.observations[0].groupMembers[0].encounterUuid).not.toBeUndefined();
            expect(results.data.observations[0].groupMembers[0].providers).not.toBeUndefined();
            expect(results.data.encounterType).toBe("FieldEncounter");
            expect(results.data).toBe(encounterData);
            done();
        });
    });


    it('should create an encounter with given encounterData, if currentProvider is then it adds currentProvider to providers list',function (done) {
        rootScope.currentProvider = {uuid: "currentProviderUuid", name: "Arman Vuiyan"};
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var encounterData = JSON.parse(readFixtures('encounter.json'));

        encounterData.providers = [];

        spyOn(offlineEncounterServiceStrategy, 'getDefaultEncounterType').and.returnValue(specUtil.respondWithPromise($q, {data: "FieldEncounter"}));
        spyOn(offlineEncounterServiceStrategy, 'create').and.returnValue(specUtil.respondWithPromise($q, {data: encounterData}));
        spyOn(eventQueue, 'addToEventQueue').and.returnValue(specUtil.respondWithPromise($q, {}));
        $bahmniCookieStore.get.and.callFake(function (cookie) {
            if (cookie == Bahmni.Common.Constants.grantProviderAccessDataCookieName) {
                return {};
            }
            if (cookie == Bahmni.Common.Constants.locationCookieName) {
                return {name: "location-name"};
            }
        });

        var result = encounterService.create(encounterData).then(function(results){
            expect(offlineEncounterServiceStrategy.getDefaultEncounterType.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.getDefaultEncounterType).toHaveBeenCalledWith();
            expect(offlineEncounterServiceStrategy.create.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.create).toHaveBeenCalledWith(encounterData);
            expect(eventQueue.addToEventQueue.calls.count()).toBe(1);
            expect(eventQueue.addToEventQueue).toHaveBeenCalledWith({type: "encounter", encounterUuid: results.data.encounterUuid, dbName: "location-name"});

            expect(results.data).not.toBeUndefined();
            expect(results.data.providers).toEqual([{uuid:'currentProviderUuid', name: 'Arman Vuiyan'}]);
            expect(results.data.observations[0].groupMembers[0].providers).not.toBeUndefined();
            expect(results.data.observations[0].groupMembers[0].providers).toEqual([{uuid:'currentProviderUuid', name : 'Arman Vuiyan'}]);

            expect(results.data).toBe(encounterData);
            done();
        });
    });

    it('should create an encounter with given encounterData by adding uuid, encounterUuid, encounterDateTime to obs, if observations doesnt have uuid, encounterUuid, encounterDateTime',function (done) {
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var encounterData = JSON.parse(readFixtures('encounter.json'));

        encounterData.observations[0].uuid = undefined;
        encounterData.observations[0].encounterUuid = undefined;
        encounterData.observations[0].encounterDateTime = undefined;
        encounterData.observations[0].observationDateTime = undefined;

        spyOn(offlineEncounterServiceStrategy, 'getDefaultEncounterType').and.returnValue(specUtil.respondWithPromise($q, {data: "FieldEncounter"}));
        spyOn(offlineEncounterServiceStrategy, 'create').and.returnValue(specUtil.respondWithPromise($q, {data: encounterData}));
        spyOn(eventQueue, 'addToEventQueue').and.returnValue(specUtil.respondWithPromise($q, {}));

        var result = encounterService.create(encounterData).then(function(results){
            expect(offlineEncounterServiceStrategy.getDefaultEncounterType.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.getDefaultEncounterType).toHaveBeenCalledWith();
            expect(offlineEncounterServiceStrategy.create.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.create).toHaveBeenCalledWith(encounterData);
            expect(eventQueue.addToEventQueue.calls.count()).toBe(1);
            expect(eventQueue.addToEventQueue).toHaveBeenCalledWith({type: "encounter", encounterUuid: results.data.encounterUuid, dbName: "location-name"});

            expect(results.data.observations[0].uuid).not.toBeUndefined();
            expect(results.data.observations[0].encounterUuid).not.toBeUndefined();
            expect(results.data.observations[0].encounterUuid).toBe(encounterData.encounterUuid);
            expect(results.data.observations[0].encounterDateTime).not.toBeUndefined();
            expect(results.data.observations[0].encounterDateTime).toBe(encounterData.encounterDateTime);
            expect(results.data.observations[0].observationDateTime).not.toBeUndefined();
            expect(results.data).toBe(encounterData);
            done();
        });
    });


    it('should create an encounter with given encounterData by removing isObservation, isObservationNode from each observation ',function (done) {
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var encounterData = JSON.parse(readFixtures('encounter.json'));

        encounterData.observations[0].isObservation = {isObs: true};
        encounterData.observations[0].isObservationNode = {isObsNode: true};
        encounterData.encounterDateTime = undefined;

        spyOn(offlineEncounterServiceStrategy, 'getDefaultEncounterType').and.returnValue(specUtil.respondWithPromise($q, {data: "FieldEncounter"}));
        spyOn(offlineEncounterServiceStrategy, 'create').and.returnValue(specUtil.respondWithPromise($q, {data: encounterData}));
        spyOn(eventQueue, 'addToEventQueue').and.returnValue(specUtil.respondWithPromise($q, {}));

        var result = encounterService.create(encounterData).then(function(results){
            expect(offlineEncounterServiceStrategy.getDefaultEncounterType.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.getDefaultEncounterType).toHaveBeenCalledWith();
            expect(offlineEncounterServiceStrategy.create.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.create).toHaveBeenCalledWith(encounterData);
            expect(eventQueue.addToEventQueue.calls.count()).toBe(1);
            expect(eventQueue.addToEventQueue).toHaveBeenCalledWith({type: "encounter", encounterUuid: results.data.encounterUuid, dbName: "location-name"});

            expect(results.data.observations[0].isObservation).toBeUndefined();
            expect(results.data.observations[0].isObservationNode).toBeUndefined();
            expect(results.data.observations[0].groupMembers[0].encounterDateTime).not.toBeUndefined();
            expect(results.data.observations[0].groupMembers[0].encounterDateTime).toBe(encounterData.encounterDateTime);
            expect(results.data).toBe(encounterData);
            done();
        });
    });


    it('should create an encounter with given observations and create observation uuid, if it is not present, for its all groupMembers',function (done) {
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var encounterData = JSON.parse(readFixtures('encounter.json'));

        encounterData.observations[0].uuid = undefined;
        encounterData.observations[0].groupMembers[5].uuid = undefined;
        encounterData.observations[0].groupMembers[5].groupMembers[0].uuid = undefined;

        spyOn(offlineEncounterServiceStrategy, 'getDefaultEncounterType').and.returnValue(specUtil.respondWithPromise($q, {data: "FieldEncounter"}));
        spyOn(offlineEncounterServiceStrategy, 'create').and.returnValue(specUtil.respondWithPromise($q, {data: encounterData}));
        spyOn(eventQueue, 'addToEventQueue').and.returnValue(specUtil.respondWithPromise($q, {}));

        var result = encounterService.create(encounterData).then(function(results){
            expect(offlineEncounterServiceStrategy.getDefaultEncounterType.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.getDefaultEncounterType).toHaveBeenCalledWith();
            expect(offlineEncounterServiceStrategy.create.calls.count()).toBe(1);
            expect(offlineEncounterServiceStrategy.create).toHaveBeenCalledWith(encounterData);
            expect(eventQueue.addToEventQueue.calls.count()).toBe(1);
            expect(eventQueue.addToEventQueue).toHaveBeenCalledWith({type: "encounter", encounterUuid: results.data.encounterUuid, dbName: "location-name"});

            expect(results.data.observations[0].uuid).not.toBeUndefined();
            expect(results.data.observations[0].groupMembers[5].uuid).not.toBeUndefined();
            expect(results.data.observations[0].groupMembers[5].groupMembers[0].uuid).not.toBeUndefined();
            expect(results.data).toBe(encounterData);
            done();
        });
    });
});