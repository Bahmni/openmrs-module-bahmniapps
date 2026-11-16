'use strict';

describe('ssoConfig', function () {
    var $rootScope, $q, $httpBackend, localeService, ssoConfig;

    beforeEach(module('bahmni.home'));
    beforeEach(module(function ($provide) {
        localeService = jasmine.createSpyObj('localeService', ['getLoginText']);
        $provide.value('localeService', localeService);
    }));

    beforeEach(inject(function (_$rootScope_, _$q_, _ssoConfig_, _$httpBackend_) {
        $rootScope = _$rootScope_;
        $q = _$q_;
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('../i18n/home/locale_en.json').respond({});
        $httpBackend.whenGET('../i18n/common/locale_en.json').respond({});
        $httpBackend.whenGET('/bahmni_config/openmrs/i18n/home/locale_en.json').respond({});
        $httpBackend.whenGET('/bahmni_config/openmrs/i18n/common/locale_en.json').respond({});
        ssoConfig = _ssoConfig_;
    }));

    it('should be enabled with the configured login url when ssoEnabled is true', function () {
        localeService.getLoginText.and.returnValue($q.when({data: {loginPage: {ssoEnabled: true, ssoLoginUrl: '/custom/login', ssoLogoutUrl: '/custom/logout'}}}));
        var result;

        ssoConfig.get().then(function (sso) {
            result = sso;
        });
        $rootScope.$digest();

        expect(result).toEqual({enabled: true, loginUrl: '/custom/login', logoutUrl: '/custom/logout'});
    });

    it('should be disabled with the default login url when the config cannot be loaded', function () {
        localeService.getLoginText.and.returnValue($q.reject('error'));
        var result;

        ssoConfig.get().then(function (sso) {
            result = sso;
        });
        $rootScope.$digest();

        expect(result).toEqual({
            enabled: false,
            loginUrl: Bahmni.Common.Constants.ssoLoginUrl,
            logoutUrl: Bahmni.Common.Constants.ssoLogoutUrl
        });
    });

    it('should fall back to the default urls when only ssoEnabled is configured', function () {
        localeService.getLoginText.and.returnValue($q.when({data: {loginPage: {ssoEnabled: true}}}));
        var result;

        ssoConfig.get().then(function (sso) {
            result = sso;
        });
        $rootScope.$digest();

        expect(result).toEqual({
            enabled: true,
            loginUrl: Bahmni.Common.Constants.ssoLoginUrl,
            logoutUrl: Bahmni.Common.Constants.ssoLogoutUrl
        });
    });
});
