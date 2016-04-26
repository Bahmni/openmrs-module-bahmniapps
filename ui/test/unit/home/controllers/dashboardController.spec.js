'use strict';

xdescribe('dashboardController', function () {


    var $aController, window;
    var scopeMock,rootScopeMock,_spinner,httpBackend, $q,state, $bahmniCookieStore, locationService,offlineService,appServiceMock,scheduledSyncMock;

    beforeEach(module('bahmni.home'));


    beforeEach(module(function() {
        _spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        appServiceMock = jasmine.createSpyObj('appServiceMock', ['getAppDescriptor']);
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
        offlineService = jasmine.createSpyObj('offlineService', ['isOfflineApp']);
        offlineService.isOfflineApp.and.returnValue(true);
        scheduledSyncMock = jasmine.createSpyObj('scheduledSync', ['jobInit','isJobRunning']);
        scheduledSyncMock.isJobRunning.and.returnValue(specUtil.createFakePromise());
        locationService.getAllByTag.and.returnValue(specUtil.createFakePromise({"data":{"results":{}}}));
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
        $aController('DashboardController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $window: window,
            $state: state,
            $q: $q,
            locationService: locationService,
            spinner: _spinner,
            appService: appServiceMock,
            offlineService: offlineService,
            scheduledSync:scheduledSyncMock,
            $bahmniCookieStore: $bahmniCookieStore,
        });
    });

    it("should sync data when app is offline", function () {
        scopeMock.$digest();
        expect(offlineService.isOfflineApp).toHaveBeenCalled();
        expect(scopeMock.isSyncing).toBe(true);
    });

    it("should intialize sync process in offline", function () {
        scheduledSyncMock.isJobRunning.and.returnValue(null);
        scopeMock.$digest();
        expect(scopeMock.isSyncing).toBeUndefined();
    });
});