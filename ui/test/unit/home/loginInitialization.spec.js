'use strict';

describe('loginInitialization', function () {
    var loginInitialization;
    var loadConfigService;
    var locationService;
    var spinner;
    var messagingService;
    var $q;
    var $rootScope;
    var $httpBackend;

    beforeEach(module('bahmni.home'));

    beforeEach(module(function ($provide) {
        locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
        loadConfigService = jasmine.createSpyObj('loadConfigService', ['loadConfig']);
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);

        $provide.value('locationService', locationService);
        $provide.value('loadConfigService', loadConfigService);
        $provide.value('spinner', spinner);
        $provide.value('messagingService', messagingService);
    }));

    beforeEach(inject(function (_loginInitialization_, _$q_, _$rootScope_, _$httpBackend_) {
        loginInitialization = _loginInitialization_;
        $q = _$q_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;

        spinner.forPromise.and.callFake(function (promise) {
            return promise;
        });

        locationService.getAllByTag.and.returnValue(
            specUtil.respondWithPromise($q, {data: {results: []}})
        );

        $httpBackend.whenGET('../i18n/home/locale_en.json').respond({});
        $httpBackend.whenGET('../i18n/common/locale_en.json').respond({});
        $httpBackend.whenGET('/bahmni_config/openmrs/i18n/home/locale_en.json').respond({});
        $httpBackend.whenGET('../i18n/common/locale_en.json').respond({});
        $httpBackend.whenGET('/bahmni_config/openmrs/i18n/common/locale_en.json').respond({});
    }));

    afterEach(function () {
        localStorage.clear();
    });

    it('should set enableCommandPalette to true when home config enables it', function () {
        loadConfigService.loadConfig.and.returnValue(
            specUtil.respondWithPromise($q, {data: {config: {enableCommandPalette: true}}})
        );

        loginInitialization();
        $rootScope.$apply();
        $httpBackend.flush();
        expect(localStorage.getItem('enableCommandPalette')).toBe('true');
    });

    it('should set enableCommandPalette to false when home config disables it', function () {
        loadConfigService.loadConfig.and.returnValue(
            specUtil.respondWithPromise($q, {data: {config: {enableCommandPalette: false}}})
        );

        loginInitialization();
        $rootScope.$apply();
        $httpBackend.flush();
        expect(localStorage.getItem('enableCommandPalette')).toBe('false');
    });

    describe('loadHomeConfig', function () {
        it('should write homeUrl and enableCommandPalette without loading login locations', function () {
            loadConfigService.loadConfig.and.returnValue(
                specUtil.respondWithPromise($q, {data: {config: {homeUrl: '/custom-home', enableCommandPalette: true}}})
            );

            loginInitialization.loadHomeConfig();
            $rootScope.$apply();

            expect(localStorage.getItem('homeUrl')).toBe('/custom-home');
            expect(localStorage.getItem('enableCommandPalette')).toBe('true');
            expect($rootScope.homeURL).toBe('/custom-home');
            expect(locationService.getAllByTag).not.toHaveBeenCalled();
        });

        it('should fall back to defaults and still resolve when the config cannot be loaded', function () {
            loadConfigService.loadConfig.and.returnValue($q.reject('error'));
            var resolved = false;

            loginInitialization.loadHomeConfig().then(function () {
                resolved = true;
            });
            $rootScope.$apply();

            expect(resolved).toBe(true);
            expect(localStorage.getItem('homeUrl')).toBe(Bahmni.Common.Constants.homeUrl);
            expect(localStorage.getItem('enableCommandPalette')).toBe('false');
        });
    });
});