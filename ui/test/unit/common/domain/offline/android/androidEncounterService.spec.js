'use strict';

describe('EncounterService', function () {

    var $bahmniCookieStore;
    var encounterService,androidDbService;
    var $q= Q;
    var rootScope = {currentProvider: {uuid: 'provider-uuid'}};

    beforeEach(module('bahmni.common.domain'));
    beforeEach(module('bahmni.common.offline'));

    beforeEach(module(function ($provide) {
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get']);
        var loginLocationToEncounterTypeMapping = {
            "value" :{
                "results": [
                    {   "entity": {"uuid": "locationUuid", "name": "login location"},
                        "mappings": [ {"uuid":"encounterUuid"}]}
                ]}};

        $provide.value('$q', $q);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
        $provide.value('$rootScope', rootScope);
    }));

    beforeEach(inject(['encounterService','androidDbService', function (encounterServiceInjected,androidDbServiceInjected) {
        encounterService = encounterServiceInjected;
        androidDbService = androidDbServiceInjected;
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
        spyOn(androidDbService, 'getReferenceData').and.returnValue(specUtil.respondWithPromise($q,loginLocationToEncounterTypeMapping));
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
        spyOn(androidDbService, "getReferenceData").and.callFake(function(referenceData) {
            if (referenceData == "DefaultEncounterType") return specUtil.respondWithPromise($q, defaultEncounterType);
            if (referenceData == "LoginLocationToEncounterTypeMapping") return specUtil.respondWithPromise($q, loginLocationToEncounterTypeMapping);
            return null;
        });
        encounterService.getEncounterType(programUuid, locationUuid).then(function (response) {
            expect(response.data.results[0].uuid).toBe("defaultEncounterUuid");
            done();
        });
    });
  });