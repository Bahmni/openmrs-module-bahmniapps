/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

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

    it('should disable caching while fetching the allowed list of locales', function () {
        _$http.get.and.returnValue(specUtil.respondWith({"data": localesList}));

        localeService.allowedLocalesList();

        var requestConfig = _$http.get.calls.mostRecent().args[1];
        expect(requestConfig.cache).toBe(false);
        expect(requestConfig.headers['Cache-Control']).toEqual('no-cache');
        expect(requestConfig.headers.Pragma).toEqual('no-cache');
    });

    it('should disable caching while fetching locale languages', function () {
        _$http.get.and.returnValue(specUtil.respondWith({"data": localeLangs}));

        localeService.getLocalesLangs();

        var requestConfig = _$http.get.calls.mostRecent().args[1];
        expect(requestConfig.cache).toBe(false);
        expect(requestConfig.headers['Cache-Control']).toEqual('no-cache');
        expect(requestConfig.headers.Pragma).toEqual('no-cache');
    });
});