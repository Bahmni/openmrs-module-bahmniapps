'use strict';

describe('postLoginService', function () {
    var postLoginService, $rootScope, $bahmniCookieStore, $httpBackend;

    beforeEach(module('bahmni.home'));
    beforeEach(module(function ($provide) {
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get', 'put', 'remove']);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
    }));

    beforeEach(inject(function (_postLoginService_, _$rootScope_, _$httpBackend_) {
        postLoginService = _postLoginService_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('../i18n/home/locale_en.json').respond({});
        $httpBackend.whenGET('../i18n/common/locale_en.json').respond({});
        $httpBackend.whenGET('/bahmni_config/openmrs/i18n/home/locale_en.json').respond({});
        $httpBackend.whenGET('/bahmni_config/openmrs/i18n/common/locale_en.json').respond({});
        localStorage.removeItem('loginLocations');
    }));

    afterEach(function () {
        localStorage.removeItem('loginLocations');
    });

    var provider = function (attributes) {
        return {provider: {attributes: attributes}};
    };

    var loginLocationsAttribute = function (name, uuid) {
        return {attributeType: {display: 'Login Locations'}, value: {name: name, uuid: uuid}};
    };

    describe('saveAssignedLoginLocations', function () {
        it('should store the provider login locations', function () {
            postLoginService.saveAssignedLoginLocations(provider([
                loginLocationsAttribute('OPD', 'opd-uuid'),
                loginLocationsAttribute('IPD', 'ipd-uuid')
            ]));

            expect(JSON.parse(localStorage.getItem('loginLocations'))).toEqual([
                {display: 'OPD', uuid: 'opd-uuid'},
                {display: 'IPD', uuid: 'ipd-uuid'}
            ]);
        });

        it('should ignore attributes that are not login locations and clear a stale list', function () {
            localStorage.setItem('loginLocations', JSON.stringify([{display: 'Old', uuid: 'old-uuid'}]));

            postLoginService.saveAssignedLoginLocations(provider([
                {attributeType: {display: 'Something else'}, value: {name: 'x', uuid: 'x-uuid'}}
            ]));

            expect(localStorage.getItem('loginLocations')).toBeNull();
        });

        it('should clear a stale list when the provider has no attributes or the user has no provider', function () {
            localStorage.setItem('loginLocations', JSON.stringify([{display: 'Old', uuid: 'old-uuid'}]));
            postLoginService.saveAssignedLoginLocations({});
            expect(localStorage.getItem('loginLocations')).toBeNull();

            localStorage.setItem('loginLocations', JSON.stringify([{display: 'Old', uuid: 'old-uuid'}]));
            postLoginService.saveAssignedLoginLocations(undefined);
            expect(localStorage.getItem('loginLocations')).toBeNull();
        });
    });

    describe('onLoggedIn', function () {
        it('should clear the retrospective entry date and broadcast the login event', function () {
            var loggedIn = jasmine.createSpy('loggedIn');
            $rootScope.$on('event:auth-loggedin', loggedIn);

            postLoginService.onLoggedIn();

            expect($bahmniCookieStore.remove).toHaveBeenCalledWith(
                Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, {path: '/', expires: 1});
            expect(loggedIn).toHaveBeenCalled();
        });
    });
});
