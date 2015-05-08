'use strict';

describe('EncounterService', function () {

    var $http,
        $bahmniCookieStore,
        mockHttp = {defaults: {headers: {common: {'X-Requested-With': 'present'}} },
            post: jasmine.createSpy('Http post').and.returnValue('success')};

    beforeEach(module('bahmni.registration'));
    beforeEach(module(function ($provide) {
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore',['get']);
        $provide.value('$http', mockHttp);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
    }));

    it('should create a encounter', inject(['encounterService', function (encounterService) {
        var openmrsUrl = 'http://blah.com';
        Bahmni.Registration.Constants.openmrsUrl = openmrsUrl;
        var encounter = {
            "encounterTypeUuid": "b469afaa-c79a-11e2-b284-107d46e7b2c5",
            "patientUuid": "027eca99-0b1e-4421-954e-e8778161ddc1",
            "visitTypeUuid": "b5c3bd82-c79a-11e2-b284-107d46e7b2c5",
            "observations":[
                {"value":10, "concept": {"name": "REGISTRATION FEES", "uuid": "b4afc27e-c79a-11e2-b284-107d46e7b2c5"} },
                {"value": null, "concept": {"name": "HEIGHT", "uuid": "b4b371da-c79a-11e2-b284-107d46e7b2c5"} }
            ]
        };

        var results = encounterService.create(encounter);

        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniEncounterUrl);
        expect(mockHttp.post.calls.mostRecent().args[1]).toEqual(encounter);
        expect(results).toBe('success');
    }]));

});