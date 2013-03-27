'use strict';

describe('Patient attributes', function () {
    var baseUrl = 'http://blah.com';

    var rootScope = {};
    var mockHttpGet = {
        defaults: {headers: {common: {'X-Requested-With': 'present'}} },
        get: jasmine.createSpy('Http get').andReturn({objectReturned: true})
    };

    beforeEach(module('resources.patientAttributeType'));
    beforeEach(module(function ($provide) {
        rootScope.BaseUrl = baseUrl;
        $provide.value('$http', mockHttpGet);
        $provide.value('$rootScope', rootScope);
    }));

    it('Should make call to getAll', inject(['patientAttributeType',function (patientAttribute) {
        var results = patientAttribute.getAll();

        expect(mockHttpGet.get).toHaveBeenCalled();
        expect(mockHttpGet.get.mostRecentCall.args[0]).toBe(baseUrl + '/ws/rest/v1/personattributetype?v=full');
        expect(results.objectReturned).toBe(true);
    }]));
});
