'use strict';

describe('EncounterService', function () {

    var $http,
        $bahmniCookieStore,
        mockHttp = {defaults: {headers: {common: {'X-Requested-With': 'present'}} },
            post: jasmine.createSpy('Http post').and.returnValue('success')};
    var rootScope = {currentProvider: {uuid: 'provider-uuid'}};

    beforeEach(module('bahmni.registration'));
    beforeEach(module(function ($provide) {
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get']);
        $provide.value('$http', mockHttp);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
        $provide.value('$rootScope', rootScope);
    }));

    it('should create a encounter', inject(['encounterService', function (encounterService) {
        var openmrsUrl = 'http://blah.com';
        Bahmni.Registration.Constants.openmrsUrl = openmrsUrl;
        var encounter = {
            "encounterTypeUuid": "b469afaa-c79a-11e2-b284-107d46e7b2c5",
            "patientUuid": "027eca99-0b1e-4421-954e-e8778161ddc1",
            "visitTypeUuid": "b5c3bd82-c79a-11e2-b284-107d46e7b2c5",
            "observations": [
                {"value": 10, "concept": {"name": "REGISTRATION FEES", "uuid": "b4afc27e-c79a-11e2-b284-107d46e7b2c5"} },
                {"value": null, "concept": {"name": "HEIGHT", "uuid": "b4b371da-c79a-11e2-b284-107d46e7b2c5"} }
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
                {"value": null, "concept": {"name": "HEIGHT", "uuid": "b4b371da-c79a-11e2-b284-107d46e7b2c5"} }
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
                {"value": null, "concept": {"name": "HEIGHT", "uuid": "b4b371da-c79a-11e2-b284-107d46e7b2c5"} }
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
                {"value": null, "concept": {"name": "HEIGHT", "uuid": "b4b371da-c79a-11e2-b284-107d46e7b2c5"} }
            ],
            providers: [{uuid: "existing-provider-uuid"}]

        };

        var results = encounterService.buildEncounter(encounter);

        expect(results.providers.length).toBe(1);
        expect(results.providers[0].uuid).toBe("existing-provider-uuid");
    }]));

});