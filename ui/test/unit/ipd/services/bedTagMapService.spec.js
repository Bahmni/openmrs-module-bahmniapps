'use strict';

describe('bedTagMapService', function () {
    var bedTagMapService;
    var mockHttp = jasmine.createSpyObj('$http', ['get', 'post', 'delete']);
    var bedTags = [{"id":1,"name":"Lost","uuid":"73e846d6-ed5f-11e6-a3c9-0800274a5156"},{"id":2,"name":"Oxygen","uuid":"74d2757a-ed5f-11e6-a3c9-0800274a5156"},{"id":3,"name":"Isolation","uuid":"76783641-ed5f-11e6-a3c9-0800274a5156"},{"id":4,"name":"Strict Isolation","uuid":"7739dc9f-ed5f-11e6-a3c9-0800274a5156"}];
    var bedTagMapUuid = "bedTagMapUuid";
    mockHttp.get.and.callFake(function(param) {
        return specUtil.simplePromise(bedTags);
    });
    mockHttp.post.and.callFake(function(param) {
        return specUtil.respondWith(bedTagMapUuid);
    });
    mockHttp.delete.and.callFake(function(param) {
        return specUtil.respondWith("no content");
    });

    beforeEach(function () {
        module('bahmni.ipd');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
        });

        inject(['bedTagMapService', function (bedTagMapServiceInjected) {
            bedTagMapService = bedTagMapServiceInjected;
        }]);
    });

    it('should get all the bedTags available', function (done) {
        bedTagMapService.getAllBedTags().then(function(response) {
            expect(response).toEqual(bedTags);
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.IPD.Constants.getAllBedTags);
    });


    it('should assign given tag to bed and respond with tagMapUuid', function (done) {
        var bedTagId = 2;
        var bedId = 1;
        var requestPayload = {
            "bedTag": {"id": bedTagId},
            "bed": {"id": bedId}
        };
        var headers = {"Content-Type": "application/json", "Accept": "application/json"};

        bedTagMapService.assignTagToABed(bedTagId, bedId).then(function(response) {
            expect(response).toEqual(bedTagMapUuid);
            done();
        });
        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.calls.mostRecent().args[0]).toBe(Bahmni.IPD.Constants.bedTagMapUrl);
        expect(mockHttp.post.calls.mostRecent().args[1]).toEqual(requestPayload);
        expect(mockHttp.post.calls.mostRecent().args[2]).toEqual(headers);
    });

    it('should void the bedTagMap using given tagMapUuid', function () {
        bedTagMapService.unAssignTagFromTheBed(bedTagMapUuid);
        expect(mockHttp.delete).toHaveBeenCalled();
        expect(mockHttp.delete.calls.mostRecent().args[0]).toBe(Bahmni.IPD.Constants.bedTagMapUrl+bedTagMapUuid);
    });
});