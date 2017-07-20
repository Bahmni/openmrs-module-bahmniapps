'use strict';

describe('EncounterService', function () {

    var $bahmniCookieStore;
    var encounterService, offlineDbService;
    var $q= Q;
    var rootScope = {currentProvider: {uuid: 'provider-uuid'}};

    beforeEach(module('bahmni.common.domain'));
    beforeEach(module('bahmni.common.offline'));

    beforeEach(module(function ($provide) {
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get']);
        $provide.value('$q', $q);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
        $provide.value('$rootScope', rootScope);
    }));

    beforeEach(inject(['encounterService','offlineDbService', function (encounterServiceInjected,offlineDbServiceInjected) {
        encounterService = encounterServiceInjected;
        offlineDbService = offlineDbServiceInjected;
    }]));

    it('should get encounter type based on login location when login location uuid is present',function (done) {
        var programUuid = undefined;
        var locationUuid = "locationUuid";
        var loginLocationToEncounterTypeMapping = {
            "data" :{
                "results": [
                    {   "entity": {"uuid": "locationUuid", "name": "login location"},
                        "mappings": [{"uuid": "encounterUuid"}]}
                ]}};
        spyOn(offlineDbService, 'getReferenceData').and.returnValue(specUtil.respondWithPromise($q,loginLocationToEncounterTypeMapping));
        encounterService.getEncounterType(programUuid, locationUuid).then(function (response) {
            expect(response[0].uuid).toBe("encounterUuid");
            done();
        });
    });

    it('should get default encounter type when there is no encounter mapping for login location',function (done) {
        var programUuid = undefined;
        var locationUuid = "locationUuid";
        var loginLocationToEncounterTypeMapping = {
            "data" :{
                "results": [
                    {   "entity": {"uuid": "locationUuid", "name": "login location"},
                        "mappings": []}
                ]}};

        var defaultEncounterType= {
            "data" : {
                "results": [{"uuid": "defaultEncounterUuid"}]
            }
        };
        spyOn(offlineDbService, "getReferenceData").and.callFake(function(referenceData) {
            if (referenceData == "LoginLocationToEncounterTypeMapping") {
                return specUtil.respondWithPromise($q, loginLocationToEncounterTypeMapping);
            }
            if (referenceData == "DefaultEncounterType") {
                return specUtil.respondWithPromise($q, defaultEncounterType);
            }
            return null;
        });
        encounterService.getEncounterType(programUuid, locationUuid).then(function (response) {
            expect(response.data.results[0].uuid).toBe("defaultEncounterUuid");
            done();
        });
    });


  });