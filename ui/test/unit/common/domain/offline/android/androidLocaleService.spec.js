'use strict';

describe('localeService', function () {

    var localeService;
    var androidDbService;
    var $q= Q;

    beforeEach(function(){
        module('bahmni.common.domain');
        module('bahmni.common.offline');
        module(function ($provide){
            androidDbService = jasmine.createSpyObj('androidDbService',['getReferenceData']);
            $provide.value('$q', $q);
            $provide.value('androidDbService', androidDbService);
        });

        inject(function (_localeService_) {
            localeService = _localeService_;
        });
    });


    it('should fetch allowed list of locales for the offline app', function(done){

        var localesList = {
            "data" : "en, es, fr"
        };

        androidDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, localesList));

        localeService.allowedLocalesList().then(function (response) {
            expect(response.data).toEqual("en, es, fr");
            done();
        });
    });

});