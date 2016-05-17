'use strict';

describe('dashboardController', function () {


    var $aController, window;
    var scopeMock,rootScopeMock,_spinner,httpBackend, $q,state, $bahmniCookieStore, locationService,offlineService,appServiceMock, schedulerService;

    beforeEach(module('bahmni.home'));


    beforeEach(module(function() {

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
        offlineService = jasmine.createSpyObj('offlineService', ['isOfflineApp']);
        schedulerService = jasmine.createSpyObj('schedulerService', ['sync', 'stopSync']);

        schedulerService.sync.and.returnValue({});
        schedulerService.stopSync.and.returnValue({});

        offlineService.isOfflineApp.and.returnValue(true);
        locationService.getAllByTag.and.returnValue(specUtil.createFakePromise({"data":{"results":{}}}))

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
            $bahmniCookieStore: $bahmniCookieStore,
            schedulerService: schedulerService
        });
    });

    it("should set isOfflineApp  to true if it is chrome or android app", function () {
        scopeMock.$digest();
        expect(offlineService.isOfflineApp).toHaveBeenCalled();
        expect(scopeMock.isOfflineApp).toBeTruthy();
    });

    it("should set isSyncing to true  when user clicks on sync button", function () {
        scopeMock.$digest();
        expect(offlineService.isOfflineApp).toHaveBeenCalled();

        rootScopeMock.$broadcast("schedulerStage","stage1");
        expect(scopeMock.isSyncing).toBeTruthy();
    });

    it("should set isSyncing to false when syncing is not happening and should not restart Sync in offline App", function () {

        scopeMock.$digest();
        rootScopeMock.$broadcast("schedulerStage",null);

        expect(scopeMock.isSyncing).toBeFalsy();
        expect(schedulerService.sync).not.toHaveBeenCalled();
        expect(schedulerService.stopSync).not.toHaveBeenCalled();
    });

    it("should restart scheduler when there is an error in offline app", function () {

        scopeMock.$digest();
        rootScopeMock.$broadcast("schedulerStage",null, true);

        expect(schedulerService.sync).toHaveBeenCalled();
        expect(schedulerService.stopSync).toHaveBeenCalled();

    });

    it("should not restart scheduler when there are no errors in offline app", function () {
        scopeMock.$digest();
        rootScopeMock.$broadcast("schedulerStage",null, false);

        expect(schedulerService.sync).not.toHaveBeenCalled();
        expect(schedulerService.stopSync).not.toHaveBeenCalled();
    });

});