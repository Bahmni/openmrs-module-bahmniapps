'use strict';

describe('Patient resource', function () {
    var patientService;
    var openmrsUrl = "http://blah"

    var rootScope = {};
    var mockHttp = {
        defaults: {headers: {common: {'X-Requested-With': 'present'}}},
        get: jasmine.createSpy('Http get').andReturn({'name': 'john'}),
        post: jasmine.createSpy('Http post').andReturn('success')
    };

    var mappedPatient = {
        names: [{givenName:"someGivenName", familyName:"someFamilyName"}],
        age: 21,
        gender: "M"};
    var mockPatientMapper = {map: jasmine.createSpy().andReturn(mappedPatient)};

    beforeEach(function() {
        module('resources.patientService');

        module(function ($provide) {
            rootScope.openmrsUrl = openmrsUrl;
            $provide.value('$http', mockHttp);
            $provide.value('$rootScope', rootScope);
            $provide.value('patientMapper', mockPatientMapper);
        });

        inject(['patientService', function(patientServiceInjectted) {
            patientService = patientServiceInjectted;
        }]);

    });

    it('Should call url for search', function () {
        var query = 'john';
        var results = patientService.search(query);

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.mostRecentCall.args[0]).toBe(openmrsUrl + '/ws/rest/v1/patient');
        expect(mockHttp.get.mostRecentCall.args[1].params.q).toBe(query);
        expect(results.name).toBe('john');
    });

    it('Should create a patient', function () {
        var patientJson = {
            "gender": "M",
            "givenName": "someGivenName",
            "familyName": "someFamilyName",
            "age": "21"
        };
        var results = patientService.create(patientJson);

        expect(mockPatientMapper.map).toHaveBeenCalled();
        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.mostRecentCall.args[0]).toBe(openmrsUrl + '/ws/rest/v1/bahmnicore/patient');
        expect(mockHttp.post.mostRecentCall.args[1]).toEqual(mappedPatient);
        expect(mockHttp.post.mostRecentCall.args[2].headers['Content-Type']).toBe('application/json');
        expect(mockHttp.post.mostRecentCall.args[2].headers['Accept']).toBe('application/json');
        expect(results).toBe('success');
    });
});
