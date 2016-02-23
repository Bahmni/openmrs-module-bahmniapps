'use strict';

describe('localeService', function () {

    var localeService;
    var _$http;
    var offlineService;
    var offlineDbService;
    var $q= Q;

    beforeEach(function(){
        module('bahmni.common.domain.offline');
        module('bahmni.common.offline');
        module(function ($provide){
            _$http = jasmine.createSpyObj('$http', ['get']);
            offlineService = jasmine.createSpyObj('offlineService',['isOfflineApp', 'isAndroidApp']);
            offlineDbService = jasmine.createSpyObj('offlineDbService',['getReferenceData']);
            $provide.value('$http', _$http);
            $provide.value('$q', $q);
            $provide.value('offlineService', offlineService);
            $provide.value('offlineDbService', offlineDbService);
        });

        inject(function (_localeService_) {
            localeService = _localeService_;
        });
    });

    it('should fetch allowed list of locales', function(done){
        var localesList = "en, es, fr";

        _$http.get.and.callFake(function(param) {
            return specUtil.respondWith({"data": localesList});
        });

        localeService.allowedLocalesList().then(function (response) {
            expect(response.data).toEqual(localesList);
            done();
        });
    });

    it('should fetch allowed list of locales for the offline app', function(done){

        var localesList = {
            "value" : "en, es, fr"
        };

        offlineService.isAndroidApp.and.returnValue(false);
        offlineService.isOfflineApp.and.returnValue(true);
        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, localesList));

        localeService.allowedLocalesList().then(function (response) {
            expect(response.data).toEqual(localesList.value);
            done();
        });
    });

});