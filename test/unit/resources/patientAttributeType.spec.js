'use strict';

describe('Patient attributes', function () {

    var rootScope = {},
        mockHttpGet = {defaults: {headers: {common: {'X-Requested-With': 'present'}} },
            get: jasmine.createSpy('Http get').andReturn({objectReturned: true})};

    beforeEach(module('resources.patientAttributeType'));
    beforeEach(module(function ($provide) {
        $provide.value('$http', mockHttpGet);
        $provide.value('$rootScope', rootScope);
    }));

    it('Should make call to getAll', inject(['patientAttributeType',function (patientAttribute) {
        var baseUrl = 'http://blah.com';
        rootScope.BaseUrl = baseUrl;
        var results = patientAttribute.getAll();

        expect(mockHttpGet.get).toHaveBeenCalled();
        expect(mockHttpGet.get.mostRecentCall.args[0]).toBe(baseUrl + '/ws/rest/v1/personattributetype?v=full');
        expect(results.objectReturned).toBe(true);
    }]));
});
