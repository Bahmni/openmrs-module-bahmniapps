'use strict';

describe('Patient resource', function () {

    var rootScope = {},$http,
        mockHttp = {defaults: {headers: {common: {'X-Requested-With': 'present'}} },
            get: jasmine.createSpy('Http get').andReturn({'name': 'john'}),
            post: jasmine.createSpy('Http post').andReturn('success')};

    beforeEach(module('resources.patient'));
    beforeEach(module(function ($provide) {
        $provide.value('$http', mockHttp);
        $provide.value('$rootScope', rootScope);
    }));

    it('Should call url for search', inject(['patient', function (patient) {
        var baseUrl = 'http://blah.com';
        rootScope.BaseUrl = baseUrl;
        var query = 'john';
        var results = patient.search(query);

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.mostRecentCall.args[0]).toBe(baseUrl + '/ws/rest/v1/patient');
        expect(mockHttp.get.mostRecentCall.args[1].params.q).toBe(query);
        expect(results.name).toBe('john');
    }]));

    it('Should create a patient', inject(['patient', function (patient) {
        var baseUrl = 'http://blah.com';
        rootScope.BaseUrl = baseUrl;
        var patientJson = {
            "gender": "Male",
            "names": [{"givenName": "asdf", "familyName": "asdf"}],
            "age": "21"
        };
        var results = patient.create(patientJson);

        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.mostRecentCall.args[0]).toBe(baseUrl + '/ws/rest/v1/raxacore/patient');
        expect(mockHttp.post.mostRecentCall.args[1]).toBe(patientJson);
        expect(mockHttp.post.mostRecentCall.args[2].headers['Content-Type']).toBe('application/json');
        expect(mockHttp.post.mostRecentCall.args[2].headers['Accept']).toBe('application/json');
        expect(results).toBe('success');
    }]));

});
