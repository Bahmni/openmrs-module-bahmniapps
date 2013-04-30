'use strict';

describe('patientAttributeService', function () {

    var resultList = {"results":["result1","result2","result3","result4"]};
    var $http,
        mockHttp = {defaults:{headers:{common:{'X-Requested-With':'present'}} },
                    get:jasmine.createSpy('Http get').andReturn(resultList)
                   };

    beforeEach(module('resources.patientAttributeService'));
    beforeEach(module(function ($provide) {
        $provide.value('$http', mockHttp);
    }));

    describe("search", function () {
        it('Should get unique list of family names', inject(['patientAttributeService', function (patientAttributeService) {
            var openmrsUrl = 'http://blah.com';
            constants.openmrsUrl = openmrsUrl;
            var key = "familyName";
            var query = "res";

            var results = patientAttributeService.search(key,query);

            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.mostRecentCall.args[0]).toBe(openmrsUrl + '/ws/rest/v1/bahmnicore/unique/personname');
            expect(mockHttp.get.mostRecentCall.args[1].params.q).toBe(query);
            expect(mockHttp.get.mostRecentCall.args[1].params.key).toBe(key);
            expect(results).toBe(resultList);
        }]));

        it('Should get unique list of caste',inject(['patientAttributeService', function (patientAttributeService){
            var openmrsUrl = 'http://blah.com';
            constants.openmrsUrl = openmrsUrl;
            var key = "caste";
            var query = "res";

            var results = patientAttributeService.search(key,query);

            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.mostRecentCall.args[0]).toBe(openmrsUrl + "/ws/rest/v1/bahmnicore/unique/personattribute");
            expect(mockHttp.get.mostRecentCall.args[1].params.q).toBe(query);
            expect(mockHttp.get.mostRecentCall.args[1].params.key).toBe(key);
            expect(results).toBe(resultList);
        }]))

        it('Should trim leading whitespaces',inject(['patientAttributeService', function (patientAttributeService){
            var openmrsUrl = 'http://blah.com';
            constants.openmrsUrl = openmrsUrl;
            var key = "caste";
            var query = "       res        ";

            var results = patientAttributeService.search(key,query);

            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.mostRecentCall.args[0]).toBe(openmrsUrl + "/ws/rest/v1/bahmnicore/unique/personattribute");
            expect(mockHttp.get.mostRecentCall.args[1].params.q).toBe(query.trimLeft());
            expect(mockHttp.get.mostRecentCall.args[1].params.key).toBe(key);
            expect(results).toBe(resultList);
        }]))
    });
});