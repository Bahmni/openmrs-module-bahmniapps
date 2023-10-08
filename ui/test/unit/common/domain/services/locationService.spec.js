'use strict';

describe('LocationService', function () {
    var locationUuids = ["location1", "location2"];

    var getReturnValue = function(params, args){
        if(_.includes(params,"bahmnicore/visitLocation")){
            return {uuid: "visitLocationUuid"}
        }
        else if(_.includes(params,"bahmnicore/facilityLocation")){
            return {
                then: function (successFunction) {
                    var results = {
                        uuid: "facilityVisitLocationUuid",
                        name: "Facility Location"
                    };
                    return successFunction({data: results});
                }
            };
        }
        else{
            return locationUuids;
        }
    };

    var mockBahmniCookieStore = jasmine.createSpyObj('bahmniCookieStore', ["get"]);
    mockBahmniCookieStore.get.and.callFake(function () {
        return {uuid: "locationUuid"};
    });
    var mockHttp = {
            defaults: {
                headers: {
                    common: {
                        'X-Requested-With': 'present'
                    }
                }
            },
            get: jasmine.createSpy('Http get').and.callFake(getReturnValue)
        };

    beforeEach(module('bahmni.common.domain'));
    beforeEach(module(function ($provide) {
        $provide.value('$http', mockHttp);
        $provide.value('$bahmniCookieStore', mockBahmniCookieStore);
    }));

    it('should get locations by tag', inject(['locationService', function(locationService){
        var tag = "tag1";
        var params = { params : { s : 'byTags', tags : tag , v:"default", operator:'ALL' }, cache : true };

        var results = locationService.getAllByTag(tag);

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.locationUrl);
        expect(mockHttp.get.calls.mostRecent().args[1]).toEqual(params);
        expect(results).toBe(locationUuids);
    }]));

    it('should send empty string as query param if tags are not defined', inject(['locationService', function(locationService){
        var tag = null;
        var params = { params : { s : 'byTags', tags : "", v: "default", operator:'ALL' }, cache : true };

        var results = locationService.getAllByTag(tag);

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.locationUrl);
        expect(mockHttp.get.calls.mostRecent().args[1]).toEqual(params);
        expect(results).toBe(locationUuids);
    }]));

    it('should get location id for login location which is tagged as a Visit Location', inject(['locationService', function(locationService){
        var results = locationService.getVisitLocation('locationUuid');
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniVisitLocationUrl+'/locationUuid');
        expect(mockHttp.get).toHaveBeenCalled();
        expect(results.uuid).toBe("visitLocationUuid");

    }]));

    it('should get root location id for facility location which is tagged as a Visit Location', inject(['locationService', function(locationService){
        var results = locationService.getFacilityVisitLocation();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.bahmniFacilityLocationUrl+'/locationUuid');
        expect(mockHttp.get).toHaveBeenCalled();
        expect(results.uuid).toBe("facilityVisitLocationUuid");
        expect(results.name).toBe("Facility Location");
    }]));
});