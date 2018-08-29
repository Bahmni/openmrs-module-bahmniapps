'use strict';

describe('localeService', function () {

    var localeService;
    var _$http;
    var localesList = "en, es, fr";
    var defaultLocale = "en";
    var loginText = "BAHMNI EMR LOGIN";
    var localeLangs = "locale codes language";

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

    it('should fetch default login page text', function(done){
        _$http.get.and.callFake(function(param) {
            return specUtil.respondWith({"data": loginText});
        });

        localeService.getLoginText().then(function (response) {
            expect(response.data).toEqual(loginText);
            done();
        });
    });

    it('should fetch default locale languages', function(done){
        _$http.get.and.callFake(function(param) {
            return specUtil.respondWith({"data": localeLangs});
        });

        localeService.getLoginText().then(function (response) {
            expect(response.data).toEqual(localeLangs);
            done();
        });
    });
});