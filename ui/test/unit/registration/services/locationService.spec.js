'use strict';

describe('LocationService', function () {
    var locationUuids = ["location1", "location2"];
    var cookieStoreKey = 'bahmni.user.location';
    var $http, mockBahmniCookieStore,
        mockHttp = {defaults: {headers: {common: {'X-Requested-With': 'present'}} },
            get: jasmine.createSpy('Http get').and.returnValue(locationUuids)};
    beforeEach(module('bahmni.registration'));
    beforeEach(module(function ($provide) {
        $provide.value('$http', mockHttp);
        $provide.value('$bahmniCookieStore', mockBahmniCookieStore);
    }));

    it('should get locations by tag', inject(['locationService', function(locationService){
        var tag = "tag1";
        var params = { params : { s : 'byTags', q : tag , v:"default" }, cache : true };

        var results = locationService.getAllByTag(tag);

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.locationUrl);
        expect(mockHttp.get.calls.mostRecent().args[1]).toEqual(params);
        expect(results).toBe(locationUuids);
    }]));

    it('should send empty string as query param if tags are not defined', inject(['locationService', function(locationService){
        var tag = null;
        var params = { params : { s : 'byTags', q : "", v: "default" }, cache : true };

        var results = locationService.getAllByTag(tag);

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.locationUrl);
        expect(mockHttp.get.calls.mostRecent().args[1]).toEqual(params);
        expect(results).toBe(locationUuids);
    }]));
});