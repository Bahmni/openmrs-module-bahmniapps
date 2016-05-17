'use strict';

describe('navigationController', function () {

    var $aController, window, sce;
    var scopeMock,rootScopeMock,locationMock,offlineService,sessionServiceMock,appServiceMock,schedulerService,scheduledSyncMock;

    beforeEach(module('bahmni.registration'));


    beforeEach(module(function() {
        scopeMock = jasmine.createSpyObj('scopeMock', ['actions']);
        rootScopeMock = jasmine.createSpyObj('rootScopeMock', ['patientConfiguration']);
        locationMock = jasmine.createSpyObj('$location', ['path']);
        sessionServiceMock = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
        appServiceMock = jasmine.createSpyObj('appServiceMock', ['getAppDescriptor']);

        appServiceMock.getAppDescriptor.and.returnValue({
            getExtensions: function () { return {} }
        });
        offlineService = jasmine.createSpyObj('offlineService', ['isOfflineApp']);
        schedulerService = jasmine.createSpyObj('schedulerService', ['sync','stopSync']);
        schedulerService.sync.and.returnValue({});
        schedulerService.stopSync.and.returnValue({});

        offlineService.isOfflineApp.and.returnValue(true);
    }));

    beforeEach(
        inject(function ($controller, $rootScope, $window, $sce) {
            $aController = $controller;
            rootScopeMock = $rootScope;
            window = $window;
            sce = $sce;
            scopeMock = rootScopeMock.$new();
        })
    );

    beforeEach(function () {
        $aController('NavigationController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $location: locationMock,
            $window: window,
            $sce: sce,
            sessionService: sessionServiceMock,
            appService: appServiceMock,
            offlineService: offlineService,
            scheduledSync:scheduledSyncMock,
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

    it("should set isSyncing to false when syncing is not happening  and should not restart Sync in offlineApp", function () {

        scopeMock.$digest();
        rootScopeMock.$broadcast("schedulerStage",null);

        expect(schedulerService.sync).not.toHaveBeenCalled();
        expect(schedulerService.stopSync).not.toHaveBeenCalled();
        expect(scopeMock.isSyncing).toBeFalsy();
    });

    it("should restart scheduler when there is an error in offlineApp", function () {

        scopeMock.$digest();
        rootScopeMock.$broadcast("schedulerStage",null, true);

        expect(schedulerService.sync).toHaveBeenCalled();
        expect(schedulerService.stopSync).toHaveBeenCalled();

    });

    it("should not restart scheduler when there are no errors  in offlineApp", function () {
        scopeMock.$digest();
        rootScopeMock.$broadcast("schedulerStage",null, false);

        expect(schedulerService.sync).not.toHaveBeenCalled();
        expect(schedulerService.stopSync).not.toHaveBeenCalled();
    });
});