'use strict';

describe('LocationService', function () {
    var locationUuids = ["location1", "location2"];
    var locationService;
    var $http, mockBahmniCookieStore, offlineService, offlineDbService, $q= Q,
        mockHttp = {defaults: {headers: {common: {'X-Requested-With': 'present'}} },
            get: jasmine.createSpy('Http get').and.returnValue(locationUuids)};
    beforeEach(function() {
        module('bahmni.common.domain.offline');
        module('bahmni.common.offline');
        module(function ($provide) {
            offlineService = jasmine.createSpyObj('offlineService', ['isOfflineApp', 'isAndroidApp']);
            offlineDbService = jasmine.createSpyObj('offlineDbService', ['getReferenceData']);
            $provide.value('$http', mockHttp);
            $provide.value('$bahmniCookieStore', mockBahmniCookieStore);
            $provide.value('$q', $q);
            $provide.value('offlineService', offlineService);
            $provide.value('offlineDbService', offlineDbService);
        });

        inject(function (_locationService_) {
            locationService = _locationService_;
        });
    });

    it('should get locations by tag', function(){
        var tag = "tag1";
        var params = { params : { s : 'byTags', q : tag , v:"default" }, cache : true };

        var results = locationService.getAllByTag(tag);

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe(Bahmni.Common.Constants.locationUrl);
        expect(mockHttp.get.calls.mostRecent().args[1]).toEqual(params);
        expect(results).toBe(locationUuids);
    });

    it('should get locations for the offline app', function(done){

        var locationUuids = {
            "value": {
                "results": ["location1", "location2"]
            }
        };

        offlineService.isAndroidApp.and.returnValue(false);
        offlineService.isOfflineApp.and.returnValue(true);
        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, locationUuids));

        locationService.getAllByTag().then(function (response) {
            expect(response.data.results.length).toEqual(2);
            expect(response.data).toEqual(locationUuids.value);
            done();
        });
    });
});