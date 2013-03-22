'use strict';

describe('Concept', function () {

    var rootScope = {},$http,
        mockHttp = {defaults: {headers: {common: {'X-Requested-With': 'present'}} },
            get: jasmine.createSpy('Http get').andReturn({'display': 'CHIEF COMPLAINT'})
        };

    beforeEach(module('resources.concept'));
    beforeEach(module(function ($provide) {
        $provide.value('$http', mockHttp);
        $provide.value('$rootScope', rootScope);
    }));

    it('Should call url to get concept', inject(['concept', function (concept) {
        var baseUrl = 'http://blah.com';
        rootScope.BaseUrl = baseUrl;

        var results = concept.getRegistrationConcepts();
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.mostRecentCall.args[0]).toBe(baseUrl + '/ws/rest/v1/concept');
        expect(mockHttp.get.mostRecentCall.args[1].params.q).toBe("REGISTRATION_CONCEPTS");
        expect(results.display).toBe('CHIEF COMPLAINT');
    }]));
});