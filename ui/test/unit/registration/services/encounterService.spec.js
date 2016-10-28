'use strict';

describe('EncounterService', function () {

    var $http,
        $bahmniCookieStore,
        configurations,
        getPromise = Q.defer();
    var encounterService;

    var getFunction = function (params, args) {
        var data = {results: []};
        if (args && args.params.mappingType == "program_encountertype") {
            data = {
                results: [{
                    "mappings": [
                        {name: "Program-Consultation", uuid: 1}
                    ]
                }]
            };
            if(args.params.entityUuid == "no-mapping-program-uuid"){
                data = {results: [{mappings: []}]}
            }
        } else if (args && args.params.mappingType == "location_encountertype") {
            data = {
                results: [{
                    "mappings": [
                        {name: "OPD-Consultation", uuid: 2}
                    ]
                }]
            }
            if(args.params.entityUuid == "no-mapping-location-uuid"){
                data = {results: [{mappings: []}]}
            }
        }
        if (params == Bahmni.Common.Constants.encounterTypeUrl + '/' + "Consultation") {
            data = {
                name: "Consultation", uuid: 3
            }
        }
        getPromise.resolve();
        return specUtil.respondWith({"data": data});
    };
    var mockHttp = {
        defaults: {headers: {common: {'X-Requested-With': 'present'}}},
        get: jasmine.createSpy('Http get').and.callFake(getFunction),
        post: jasmine.createSpy('Http post').and.returnValue('success')
    };
    var rootScope = {currentProvider: {uuid: 'provider-uuid'}};

    beforeEach(module('bahmni.registration'));
    beforeEach(module(function ($provide) {
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get']);
        configurations = jasmine.createSpyObj('configurations', ['defaultEncounterType']);
        configurations.defaultEncounterType.and.returnValue("Consultation");
        $provide.value('$http', mockHttp);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
        $provide.value('$rootScope', rootScope);
        $provide.value('configurations', configurations);
        $provide.value('offlineService', {});
    }));

    beforeEach(inject(['encounterService', function (encounterServiceInjected) {
        encounterService = encounterServiceInjected;
    }]));


    it('should create a encounter', inject(['encounterService', function (encounterService) {
        var openmrsUrl = 'http://blah.com';
        Bahmni.Registration.Constants.openmrsUrl = openmrsUrl;
        var encounter = {
            "encounterTypeUuid": "b469afaa-c79a-11e2-b284-107d46e7b2c5",
            "patientUuid": "027eca99-0b1e-4421-954e-e8778161ddc1",
            "visitTypeUuid": "b5c3bd82-c79a-11e2-b284-107d46e7b2c5",
            "observations": [
                {"value": 10, "concept": {"name": "REGISTRATION FEES", "uuid": "b4afc27e-c79a-11e2-b284-107d46e7b2c5"}},
                {"value": null, "concept": {"name": "HEIGHT", "uuid": "b4b371da-c79a-11e2-b284-107d46e7b2c5"}}
            ]
        };

        var results = encounterService.create(encounter);

        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniEncounterUrl);
        expect(mockHttp.post.calls.mostRecent().args[1]).toEqual(encounter);
        expect(results).toBe('success');
    }]));

    it('should build encounter with provider from rootscope if there are no providers in encounter and cookie store', inject(['encounterService', function (encounterService) {
        var openmrsUrl = 'http://blah.com';
        Bahmni.Registration.Constants.openmrsUrl = openmrsUrl;
        var encounter = {
            "encounterTypeUuid": "b469afaa-c79a-11e2-b284-107d46e7b2c5",
            "patientUuid": "027eca99-0b1e-4421-954e-e8778161ddc1",
            "visitTypeUuid": "b5c3bd82-c79a-11e2-b284-107d46e7b2c5",
            "observations": [
                {"value": null, "concept": {"name": "HEIGHT", "uuid": "b4b371da-c79a-11e2-b284-107d46e7b2c5"}}
            ]
        };

        var results = encounterService.buildEncounter(encounter);

        expect(results.providers.length).toBe(1);
        expect(results.providers[0].uuid).toBe("provider-uuid");

    }]));
    it('should build encounter with provider from cookie store if there are no providers in encounter', inject(['encounterService', function (encounterService) {
        var openmrsUrl = 'http://blah.com';
        $bahmniCookieStore.get.and.returnValue({uuid: "provider-from-cookie"});

        Bahmni.Registration.Constants.openmrsUrl = openmrsUrl;
        var encounter = {
            "encounterTypeUuid": "b469afaa-c79a-11e2-b284-107d46e7b2c5",
            "patientUuid": "027eca99-0b1e-4421-954e-e8778161ddc1",
            "visitTypeUuid": "b5c3bd82-c79a-11e2-b284-107d46e7b2c5",
            "observations": [
                {"value": null, "concept": {"name": "HEIGHT", "uuid": "b4b371da-c79a-11e2-b284-107d46e7b2c5"}}
            ]
        };

        var results = encounterService.buildEncounter(encounter);

        expect(results.providers.length).toBe(1);
        expect(results.providers[0].uuid).toBe("provider-from-cookie");
    }]));

    it('should not update providers if it is already present in encounter data', inject(['encounterService', function (encounterService) {
        var openmrsUrl = 'http://blah.com';
        Bahmni.Registration.Constants.openmrsUrl = openmrsUrl;
        var encounter = {
            "encounterTypeUuid": "b469afaa-c79a-11e2-b284-107d46e7b2c5",
            "patientUuid": "027eca99-0b1e-4421-954e-e8778161ddc1",
            "visitTypeUuid": "b5c3bd82-c79a-11e2-b284-107d46e7b2c5",
            "observations": [
                {"value": null, "concept": {"name": "HEIGHT", "uuid": "b4b371da-c79a-11e2-b284-107d46e7b2c5"}}
            ],
            providers: [{uuid: "existing-provider-uuid"}]

        };

        var results = encounterService.buildEncounter(encounter);

        expect(results.providers.length).toBe(1);
        expect(results.providers[0].uuid).toBe("existing-provider-uuid");
    }]));

    it('should get encounter type as program encounter type if program uuid is given',function (done) {
        var programUuid = "program-uuid";
        var locationUuid = "location-uuid";
        encounterService.getEncounterType(programUuid, locationUuid).then(function (response) {
            expect(response.name).toBe("Program-Consultation");
            expect(response.uuid).toBe(1);
            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.entityMappingUrl);
            expect(mockHttp.get.calls.mostRecent().args[1].params.mappingType).toEqual("program_encountertype");
            done();
        });

    });

    it('should set encounter type as default encounter type if there is no mapping for program encounter type',function (done) {
        var programUuid = "no-mapping-program-uuid";
        var locationUuid = "location-uuid";
        encounterService.getEncounterType(programUuid, locationUuid).then(function (response) {
            expect(response.name).toBe("Consultation");
            expect(response.uuid).toBe(3);
            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.encounterTypeUrl + '/' + "Consultation");
            done();
        });

    });

    it('should get encounter type as location encounter type if program uuid is null and location uuid is given', function (done) {
        var programUuid = null;
        var locationUuid = "location-uuid";
        encounterService.getEncounterType(programUuid, locationUuid).then(function (response) {
            expect(response.name).toBe("OPD-Consultation");
            expect(response.uuid).toBe(2);
            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.entityMappingUrl);
            expect(mockHttp.get.calls.mostRecent().args[1].params.mappingType).toEqual("location_encountertype");
            done();
        });
    });

    it('should set encounter type as default encounter type if there is no mapping for location encounter type',function (done) {
        var programUuid = null;
        var locationUuid = "no-mapping-location-uuid";
        encounterService.getEncounterType(programUuid, locationUuid).then(function (response) {
            expect(response.name).toBe("Consultation");
            expect(response.uuid).toBe(3);
            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.encounterTypeUrl + '/' + "Consultation");
            done();
        });

    });

    it('should get default encounter type if both program uuid and location uuid are null',  function (done) {
        var programUuid = null;
        var locationUuid = null;
        encounterService.getEncounterType(programUuid, locationUuid).then(function (response) {
            expect(response.name).toEqual("Consultation");
            expect(response.uuid).toBe(3);
            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.encounterTypeUrl + '/' + "Consultation");

            done();
        });
    });

    it('should getEncountersForEncounterType be called with id,uuid,obsDatetime,value,comment to get the obs with those params in the encounters',  function (done) {
        var patientUuid = "patientUuid";
        var encounterTypeUuid = "encounterTypeUuid";
        var requestParams = {
            params: {
                patient: patientUuid,
                encounterType: encounterTypeUuid,
                v: "custom:(uuid,provider,visit:(uuid,startDatetime,stopDatetime),obs:(uuid,concept:(uuid,name),groupMembers:(id,uuid,obsDatetime,value,comment)))"
            },
            withCredentials: true
        };

        encounterService.getEncountersForEncounterType(patientUuid, encounterTypeUuid).then(function (response) {
            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.encounterUrl);
            expect(mockHttp.get.calls.mostRecent().args[1]).toEqual(requestParams);
            done();
        });
    });

});