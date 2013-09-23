'use strict';

describe('Patient visit', function () {

    var $http,
        mockHttp = {defaults: {headers: {common: {'X-Requested-With': 'present'}} },
            post: jasmine.createSpy('Http post').andReturn('success')};

    beforeEach(module('registration.patient.services'));
    beforeEach(module(function ($provide) {
        $provide.value('$http', mockHttp);
    }));

    it('Should create a visit', inject(['visitService', function (visitService) {
        var openmrsUrl = 'http://blah.com';
        constants.openmrsUrl = openmrsUrl;
        var visitJson = {
            "patient":"ee73ab73-b96b-4dbe-a6aa-f4bc1ea0340d",
            "startDatetime":"2013-03-22T06:05:19.462Z",
            "visitType":"REG",
            "encounters":[
                {
                    "patient":"ee73ab73-b96b-4dbe-a6aa-f4bc1ea0340d",
                    "encounterType":"REG",
                    "encounterDatetime":"2013-03-22T06:05:19.462Z",
                    "obs":[
                        {
                            "concept":"8032ad29-0591-4ec6-9776-22e7a3062df8",
                            "value":10
                        }
                    ]
                }
            ]
        }

        var results = visitService.create(visitJson);

        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.mostRecentCall.args[0]).toBe(constants.bahmniRESTBaseURL +  '/bahmniencounter');
        expect(mockHttp.post.mostRecentCall.args[1]).toBe(visitJson);
        expect(results).toBe('success');
    }]));

});