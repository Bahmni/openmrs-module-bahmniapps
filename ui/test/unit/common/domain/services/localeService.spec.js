'use strict';

describe('localeService', function () {

    var localeService;
    var _$http;
    var localesList = "en, es, fr";
    var defaultLocale = "en";

    beforeEach(function(){
        module('bahmni.common.domain');
        module(function ($provide){
            _$http = jasmine.createSpyObj('$http', ['get']);
            $provide.value('$http', _$http);
        });

        inject(function (_localeService_) {
            localeService = _localeService_;
        });
    });

    it('should fetch allowed list of locales', function(done){
        _$http.get.and.callFake(function(param) {
            return specUtil.respondWith({"data": localesList});
        });

        localeService.allowedLocalesList().then(function (response) {
            expect(response.data).toEqual(localesList);
            done();
        });
    });

    it('should fetch default locale', function(done){
        _$http.get.and.callFake(function(param) {
            return specUtil.respondWith({"data": defaultLocale});
        });

        localeService.defaultLocale().then(function (response) {
            expect(response.data).toEqual(defaultLocale);
            done();
        });
    });
});