'use strict';

describe('dashboardController', function () {


    var $aController, window;
    var scopeMock, rootScopeMock, _spinner, httpBackend, $q, state, $bahmniCookieStore, locationService, offlineService, appServiceMock, schedulerService, eventQueue, offlineDbService, androidDbService, networkStatusService;

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
        offlineService = jasmine.createSpyObj('offlineService', ['isOfflineApp', 'getItem', 'setItem','isAndroidApp']);
        schedulerService = jasmine.createSpyObj('schedulerService', ['sync', 'stopSync']);
        eventQueue = jasmine.createSpyObj('eventQueue', ['getCount', 'getErrorCount']);
        offlineDbService = jasmine.createSpyObj('offlineDbService',['getAllLogs']);
        androidDbService = jasmine.createSpyObj('androidDbService',['getAllLogs']);
        networkStatusService = jasmine.createSpyObj('networkStatusService',['isOnline']);

        eventQueue.getErrorCount.and.returnValue(specUtil.simplePromise(2));
        eventQueue.getCount.and.returnValue(specUtil.simplePromise(1));

        schedulerService.sync.and.returnValue({});
        schedulerService.stopSync.and.returnValue({});

        offlineService.isOfflineApp.and.returnValue(true);
        offlineService.isAndroidApp.and.returnValue(false);
        locationService.getAllByTag.and.returnValue(specUtil.createFakePromise({"data": {"results": {}}}));
        offlineDbService.getAllLogs.and.returnValue(specUtil.simplePromise(["error1"]));

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
            eventQueue: eventQueue,
            offlineDbService : offlineDbService,
            androidDbService : androidDbService,
            networkStatusService: networkStatusService
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

    it("should get lastSyncTime to have been called, if it is chrome or android app", function () {
        scopeMock.$digest();

        expect(offlineService.getItem).toHaveBeenCalledWith("lastSyncTime");
    });

    it("should set lastSyncTime, if it is chrome or android app", function () {
        offlineService.getItem.and.returnValue('2016-06-13T00:00:00.000Z');

        scopeMock.isSyncing = true;
        scopeMock.$digest();

        expect(scopeMock.lastSyncTime).toBe(moment("2016-06-13 00:00:00Z").format("dddd, MMMM Do YYYY, HH:mm:ss"));
    });

    it("should set the syncStatusMessage to Sync Failed, if there are events in errorQueue and it is chrome or android app", function () {
        eventQueue.getErrorCount.and.returnValue(specUtil.simplePromise(2));
        eventQueue.getCount.and.returnValue(specUtil.simplePromise(1));

        scopeMock.isSyncing = false;
        scopeMock.$digest();
        expect(scopeMock.syncStatusMessage).toBe("Sync Failed, Press sync button to try again");
        expect(scopeMock.errorsInSync).toBeTruthy();
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
        offlineDbService.getAllLogs.and.returnValue(specUtil.simplePromise([]));

        scopeMock.isSyncing = false;
        scopeMock.$digest();

        expect(scopeMock.syncStatusMessage).toBe("Data Synced Successfully");
        expect(scopeMock.errorsInSync).toBeFalsy();

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

    it("should set the syncStatusMessage to Data Synced Successfully and should not update lastSyncTime to current time for page refresh. OfflineService getItem called 2 times for pageLoad, onSyncButtonClick, onEachSuccessful sync", function () {
        eventQueue.getErrorCount.and.returnValue(specUtil.simplePromise(0));
        eventQueue.getCount.and.returnValue(specUtil.simplePromise(0));

        scopeMock.isSyncing = undefined;
        scopeMock.$digest();

        expect(offlineService.getItem).toHaveBeenCalledWith("lastSyncTime");
        expect(offlineService.getItem.calls.count()).toBe(2);
        expect(offlineService.setItem).not.toHaveBeenCalled();
        expect(scopeMock.syncStatusMessage).toBe("Data Synced Successfully");
    });

    it("should return true, if the extension doesn't have exclusiveOnlineModule and exclusiveOfflineModule configuration", function () {
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
        scopeMock.isOfflineApp = true;
        networkStatusService.isOnline.and.returnValue(false);

        expect(scopeMock.isVisibleExtension(extension)).toBeTruthy();
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
        scopeMock.isOfflineApp = true;
        networkStatusService.isOnline.and.returnValue(true);

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
        scopeMock.isOfflineApp = true;
        networkStatusService.isOnline.and.returnValue(false);

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
        scopeMock.isOfflineApp = true;
        networkStatusService.isOnline.and.returnValue(false);

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
        scopeMock.isOfflineApp = true;
        networkStatusService.isOnline.and.returnValue(true);

        expect(scopeMock.isVisibleExtension(extension)).toBeTruthy();
    });

    it("should return true, if it is not an offlineApp", function () {
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
        scopeMock.isOfflineApp = false;

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
        scopeMock.isOfflineApp = true;
        networkStatusService.isOnline.and.returnValue(false);

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
        scopeMock.isOfflineApp = true;
        networkStatusService.isOnline.and.returnValue(true);

        expect(scopeMock.isVisibleExtension(extension)).toBeFalsy();
    });
});