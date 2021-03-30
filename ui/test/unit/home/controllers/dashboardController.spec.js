'use strict';

describe('dashboardController', function () {


    var $aController, window, navigator;
    var scopeMock, rootScopeMock, _spinner, httpBackend, $q, state, $bahmniCookieStore, locationService, appServiceMock;

    beforeEach(module('bahmni.home'));

    beforeEach(module(function () {
        scopeMock = jasmine.createSpyObj('scopeMock', ['actions']);
        rootScopeMock = jasmine.createSpyObj('rootScopeMock', ['patientConfiguration']);
        appServiceMock = jasmine.createSpyObj('appServiceMock', ['getAppDescriptor']);
        _spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        locationService = jasmine.createSpyObj('locationService', ['getAllByTag','setSessionLocation']);
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get','remove','put']);
        $bahmniCookieStore.get.and.callFake(function(cookieName) {
            if (cookieName == Bahmni.Common.Constants.locationCookieName) {
                return  {uuid: 1, display: "Location" };
            }
        });
        appServiceMock.getAppDescriptor.and.returnValue({
            getExtensions: function () { return {} }
        });
        locationService.getAllByTag.and.returnValue(specUtil.createFakePromise({"data": {"results": {}}}));
        locationService.setSessionLocation.and.returnValue(specUtil.createFakePromise({}));
    }));

    beforeEach(
        inject(function ($controller, $rootScope, $window, $state, $httpBackend) {
            $aController = $controller;
            rootScopeMock = $rootScope;
            window = $window;
            $q = Q;
            state = $state;
            httpBackend = $httpBackend;
            scopeMock = rootScopeMock.$new();
            state.current = state.current || {views: {'dashboard-content': {templateUrl: "/template/url"}}};
            state.current.data = {extensionPointId: 'org.bahmni.home.dashboard'};
            httpBackend.expectGET("../i18n/home/locale_en.json").respond({});
            httpBackend.expectGET("/bahmni_config/openmrs/i18n/home/locale_en.json").respond({});

        })
    );

    beforeEach(function () {
        navigator = window.navigator;
        $aController('DashboardController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $window: window,
            $state: state,
            $q: $q,
            locationService: locationService,
            spinner: _spinner,
            appService: appServiceMock,
            $bahmniCookieStore: $bahmniCookieStore
        });
    });

    afterEach(function () {
        window.__defineGetter__('navigator', function () {
            return navigator;
        })
    });

    it("should return true, if the extension has exclusiveOnlineModule configuration set to true and Device is in online state", function () {
        var extension = {
            "extensionPointId": "org.bahmni.home.dashboard",
            "url": "../clinical/index.html",
            "order": 3,
            "translationKey": "Clinical",
            "requiredPrivilege": "app:clinical",
            "type": "link",
            "id": "bahmni.clinical",
            "icon": "fa-stethoscope",
            exclusiveOnlineModule: true
        };

        expect(scopeMock.isVisibleExtension(extension)).toBeTruthy();
    });

    it("should return false, if the extension has exclusiveOnlineModule configuration set to true and Device is in offline state", function () {
        var extension = {
            "extensionPointId": "org.bahmni.home.dashboard",
            "url": "../clinical/index.html",
            "order": 3,
            "translationKey": "Clinical",
            "requiredPrivilege": "app:clinical",
            "type": "link",
            "id": "bahmni.clinical",
            "icon": "fa-stethoscope",
            exclusiveOnlineModule: true
        };
        window.navigator.__defineGetter__('onLine', function(){
            return false;
        });
        expect(scopeMock.isVisibleExtension(extension)).toBeFalsy();
    });

    it("should return true, if the extension has exclusiveOnlineModule configuration set to false and Device is in offline state", function () {
        var extension = {
            "extensionPointId": "org.bahmni.home.dashboard",
            "url": "../clinical/index.html",
            "order": 3,
            "translationKey": "Clinical",
            "requiredPrivilege": "app:clinical",
            "type": "link",
            "id": "bahmni.clinical",
            "icon": "fa-stethoscope",
            exclusiveOnlineModule: false
        };

        expect(scopeMock.isVisibleExtension(extension)).toBeTruthy();
    });

    it("should return true, if the extension has exclusiveOnlineModule configuration set to false and Device is in online state", function () {
        var extension = {
            "extensionPointId": "org.bahmni.home.dashboard",
            "url": "../clinical/index.html",
            "order": 3,
            "translationKey": "Clinical",
            "requiredPrivilege": "app:clinical",
            "type": "link",
            "id": "bahmni.clinical",
            "icon": "fa-stethoscope",
            exclusiveOnlineModule: false
        };

        expect(scopeMock.isVisibleExtension(extension)).toBeTruthy();
    });

    it("should return true, if the extension has exclusiveOfflineModule configuration set to true and Device is in online state", function () {
        var extension = {
            "extensionPointId": "org.bahmni.home.dashboard",
            "url": "../clinical/index.html",
            "order": 3,
            "translationKey": "Clinical",
            "requiredPrivilege": "app:clinical",
            "type": "link",
            "id": "bahmni.clinical",
            "icon": "fa-stethoscope",
            exclusiveOfflineModule: true
        };

        window.navigator.__defineGetter__('onLine', function(){
            return false;
        });

        expect(scopeMock.isVisibleExtension(extension)).toBeTruthy();
    });

    it("should return false, if the extension has exclusiveOfflineModule configuration set to true and Device is in offline state", function () {
        var extension = {
            "extensionPointId": "org.bahmni.home.dashboard",
            "url": "../clinical/index.html",
            "order": 3,
            "translationKey": "Clinical",
            "requiredPrivilege": "app:clinical",
            "type": "link",
            "id": "bahmni.clinical",
            "icon": "fa-stethoscope",
            exclusiveOfflineModule: true
        };
        window.navigator.__defineGetter__('onLine', function(){
            return true;
        });
        expect(scopeMock.isVisibleExtension(extension)).toBeFalsy();
    });
});