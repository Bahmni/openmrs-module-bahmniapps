'use strict';

describe('dashboardController', function () {


    var $aController, window;
    var scopeMock, rootScopeMock, _spinner, httpBackend, $q, state, $bahmniCookieStore, locationService, offlineService, appServiceMock, schedulerService, eventQueue;

    beforeEach(module('bahmni.home'));
    beforeEach(module('bahmni.common.offline'));


    beforeEach(module(function () {

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
        offlineService = jasmine.createSpyObj('offlineService', ['isOfflineApp', 'getItem', 'setItem']);
        schedulerService = jasmine.createSpyObj('schedulerService', ['sync', 'stopSync']);
        eventQueue = jasmine.createSpyObj('eventQueue', ['getCount', 'getErrorCount']);

        eventQueue.getErrorCount.and.returnValue(specUtil.simplePromise(2));
        eventQueue.getCount.and.returnValue(specUtil.simplePromise(1));

        schedulerService.sync.and.returnValue({});
        schedulerService.stopSync.and.returnValue({});

        offlineService.isOfflineApp.and.returnValue(true);
        locationService.getAllByTag.and.returnValue(specUtil.createFakePromise({"data": {"results": {}}}))

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
            schedulerService: schedulerService,
            eventQueue: eventQueue
        });
    });

    it("should set isOfflineApp  to true if it is chrome or android app", function () {
        scopeMock.$digest();
        expect(offlineService.isOfflineApp).toHaveBeenCalled();
        expect(offlineService.getItem).toHaveBeenCalled();
        expect(scopeMock.isOfflineApp).toBeTruthy();
    });

    it("should set isSyncing to true  when user clicks on sync button", function () {
        scopeMock.$digest();
        expect(offlineService.isOfflineApp).toHaveBeenCalled();

        rootScopeMock.$broadcast("schedulerStage", "stage1");
        expect(scopeMock.isSyncing).toBeTruthy();
    });

    it("should set isSyncing to false when syncing is not happening and should not restart Sync in offline App", function () {

        scopeMock.$digest();
        rootScopeMock.$broadcast("schedulerStage", null);

        expect(scopeMock.isSyncing).toBeFalsy();
        expect(schedulerService.sync).not.toHaveBeenCalled();
        expect(schedulerService.stopSync).not.toHaveBeenCalled();
    });

    it("should restart scheduler when there is an error in offline app", function () {

        scopeMock.$digest();
        rootScopeMock.$broadcast("schedulerStage", null, true);

        expect(schedulerService.sync).toHaveBeenCalled();
        expect(schedulerService.stopSync).toHaveBeenCalled();

    });

    it("should not restart scheduler when there are no errors in offline app", function () {
        scopeMock.$digest();
        rootScopeMock.$broadcast("schedulerStage", null, false);

        expect(schedulerService.sync).not.toHaveBeenCalled();
        expect(schedulerService.stopSync).not.toHaveBeenCalled();
    });

    it("should set lastSyncTime, if it is chrome or android app", function () {
        scopeMock.$digest();

        expect(offlineService.getItem).toHaveBeenCalledWith("lastSyncTime");
    });

    it("should set lastSyncTime, if it is chrome or android app", function () {
        offlineService.getItem.and.returnValue(new Date("2014-06-13"));

        scopeMock.isSyncing = true;
        scopeMock.$digest();

        expect(scopeMock.lastSyncTime).toBe('Friday, June 13th 2014, 05:30:00');
    });

    it("should set the syncStatusMessage to Sync Failed, if there are events in errorQueue and it is chrome or android app", function () {
        eventQueue.getErrorCount.and.returnValue(specUtil.simplePromise(2));
        eventQueue.getCount.and.returnValue(specUtil.simplePromise(1));

        scopeMock.isSyncing = false;
        scopeMock.$digest();
        expect(scopeMock.syncStatusMessage).toBe("Sync Failed, Press sync button to try again");
    });

    it("should set the syncStatusMessage to Sync Pending, if are events in eventQueue, but no events in errorQueue and it is chrome or android app", function () {
        eventQueue.getErrorCount.and.returnValue(specUtil.simplePromise(0));
        eventQueue.getCount.and.returnValue(specUtil.simplePromise(1));

        scopeMock.isSyncing = false;
        scopeMock.$digest();

        expect(scopeMock.syncStatusMessage).toBe("Sync Pending, Press Sync button to Sync");
    });

    it("should set the syncStatusMessage to Data Synced Successfully, if no events in eventQueue, errorQueue and it is chrome or android app", function () {
        eventQueue.getErrorCount.and.returnValue(specUtil.simplePromise(0));
        eventQueue.getCount.and.returnValue(specUtil.simplePromise(0));

        scopeMock.isSyncing = false;
        scopeMock.$digest();

        expect(scopeMock.syncStatusMessage).toBe("Data Synced Successfully");
    });

    it("should set the syncStatusMessage to Sync in Progress, if no events in eventQueue, errorQueue and it is chrome or android app", function () {
        eventQueue.getErrorCount.and.returnValue(specUtil.simplePromise(2));
        eventQueue.getCount.and.returnValue(specUtil.simplePromise(0));

        scopeMock.isSyncing = true;
        scopeMock.$digest();

        expect(scopeMock.syncStatusMessage).toBe("Sync in Progress...");
    });

    it("should set the syncStatusMessage to Data Synced Successfully and lastSyncTime to current time. OfflineService getItem called 3 times for pageLoad, onSyncButtonClick, onEachSuccessful sync", function () {
        eventQueue.getErrorCount.and.returnValue(specUtil.simplePromise(0));
        eventQueue.getCount.and.returnValue(specUtil.simplePromise(0));

        scopeMock.isSyncing = false;
        scopeMock.$digest();

        expect(offlineService.getItem).toHaveBeenCalledWith("lastSyncTime");
        expect(offlineService.getItem.calls.count()).toBe(3);
        expect(offlineService.setItem).toHaveBeenCalled();
        expect(scopeMock.syncStatusMessage).toBe("Data Synced Successfully");
    });
});