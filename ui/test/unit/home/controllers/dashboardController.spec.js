'use strict';

describe('dashboardController', function () {


    var $aController, window, navigator;
    var scopeMock, rootScopeMock, _spinner, httpBackend, $q, state, $bahmniCookieStore, locationService, appServiceMock, sessionService;

    beforeEach(module('bahmni.home'));

    beforeEach(module(function () {
        sessionService = jasmine.createSpyObj('sessionService', ['updateSession']);
        scopeMock = jasmine.createSpyObj('scopeMock', ['actions']);
        rootScopeMock = jasmine.createSpyObj('rootScopeMock', ['patientConfiguration']);
        appServiceMock = jasmine.createSpyObj('appServiceMock', ['getAppDescriptor']);
        _spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
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
            $bahmniCookieStore: $bahmniCookieStore,
            sessionService: sessionService
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

    it("should return true if the extension has neither exclusiveOnlineModule nor exclusiveOfflineModule set", function () {
        var extension = {
            "extensionPointId": "org.bahmni.home.dashboard",
            "url": "../clinical/index.html",
            "order": 3,
            "translationKey": "Clinical",
            "requiredPrivilege": "app:clinical",
            "type": "link",
            "id": "bahmni.clinical",
            "icon": "fa-stethoscope"
        };
    
        window.navigator.__defineGetter__('onLine', function(){
            return true;
        });
    
        expect(scopeMock.isVisibleExtension(extension)).toBeTruthy();
    });
    
    it("should return true if the current location matches the selected location", function () {
        var currentLocation = { uuid: 1, display: "Location" };
        $bahmniCookieStore.get.and.callFake(function(cookieName) {
            if (cookieName == Bahmni.Common.Constants.locationCookieName) {
                return currentLocation;
            }
        });
    
        var selectedLocation = currentLocation;
    
        expect(scopeMock.isCurrentLocation(selectedLocation)).toBe(true);
    });

    it("should return the location object for the given UUID", function () {
        scopeMock.getLocationFor = function (uuid) {
            return _.find(scopeMock.locations, function (location) {
                return location.uuid === uuid;
            });
        };

        var locations = [
            { uuid: "uuid1", display: "Location 1" },
            { uuid: "uuid2", display: "Location 2" },
            { uuid: "uuid3", display: "Location 3" }
        ];
    
        scopeMock.locations = locations;
        var result = scopeMock.getLocationFor("uuid2");
        expect(result).toEqual(locations[1]);
    });

    describe("lab result notifications", function () {
        var createControllerFor = function (currentUser) {
            var scope = rootScopeMock.$new();
            rootScopeMock.currentUser = currentUser;
            $aController('DashboardController', {
                $scope: scope,
                $rootScope: rootScopeMock,
                $window: window,
                $state: state,
                $q: $q,
                locationService: locationService,
                spinner: _spinner,
                appService: appServiceMock,
                $bahmniCookieStore: $bahmniCookieStore,
                sessionService: sessionService
            });
            return scope;
        };

        it("should show the bell to users with the clinical app privilege and pass their uuid", function () {
            var scope = createControllerFor({uuid: "user-uuid", privileges: [{name: "app:clinical", retired: false}]});

            expect(scope.canViewLabResults).toBe(true);
            expect(scope.labResultNotificationsData).toEqual({userUuid: "user-uuid"});
        });

        it("should hide the bell from users without the clinical app privilege", function () {
            var scope = createControllerFor({uuid: "user-uuid", privileges: [{name: "app:registration", retired: false}]});

            expect(scope.canViewLabResults).toBe(false);
        });

        it("should hide the bell when the clinical app privilege is retired", function () {
            var scope = createControllerFor({uuid: "user-uuid", privileges: [{name: "app:clinical", retired: true}]});

            expect(scope.canViewLabResults).toBe(false);
        });

        it("should hide the bell when there is no current user", function () {
            expect(createControllerFor(undefined).canViewLabResults).toBe(false);
        });
    });
});