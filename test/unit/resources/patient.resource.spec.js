'use strict';

describe('Patient resource', function () {

    var rootScope = {},
        mockHttpGet = {defaults: {headers: {common: {'X-Requested-With': 'present'}} },
            get: jasmine.createSpy('Http get').andReturn({'name': 'john'})};

    beforeEach(module('resources.patient'));
    beforeEach(module(function ($provide) {
        $provide.value('$http', mockHttpGet);
        $provide.value('$rootScope', rootScope);
    }));

    it('Should call url for get', inject(['patient',function (patient) {
        var baseUrl = 'http://blah.com';
        rootScope.BaseUrl = baseUrl;
        var query = 'john';
        var results = patient.search(query);

        expect(mockHttpGet.get).toHaveBeenCalled();
        expect(mockHttpGet.get.mostRecentCall.args[0]).toBe(baseUrl + '/openmrs/ws/rest/v1/patient?q=' + query + '&v=full');
        expect(results.name).toBe('john');
    }]));
});
