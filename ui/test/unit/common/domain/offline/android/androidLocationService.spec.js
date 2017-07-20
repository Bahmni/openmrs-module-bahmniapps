'use strict';

describe('LocationService', function () {
    var locationService;
    var mockBahmniCookieStore, offlineService, androidDbService, $q= Q;
    beforeEach(module('bahmni.common.domain'));
    beforeEach(module('bahmni.common.offline'));
    beforeEach(module(function ($provide) {
            offlineService = jasmine.createSpyObj('offlineService', ['getItem']);
            androidDbService = jasmine.createSpyObj('androidDbService', ['getReferenceData']);
            $provide.value('$bahmniCookieStore', mockBahmniCookieStore);
            $provide.value('$q', $q);
            $provide.value('offlineService', offlineService);
            $provide.value('androidDbService', androidDbService);
        }));

    beforeEach(inject(function (_locationService_) {
        locationService = _locationService_;
    }));


    it('should get locations for the offline app', function(done){

        var locationUuids = {
            "data": {
                "results": ["location1", "location2"]
            }
        };

        offlineService.getItem.and.returnValue(null);
        androidDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, locationUuids));

        locationService.getAllByTag().then(function (response) {
            expect(response.data.results.length).toEqual(2);
            expect(response.data).toEqual(locationUuids.data);
            done();
        });
    });
});