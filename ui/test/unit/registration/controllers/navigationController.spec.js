'use strict';

xdescribe('navigationController', function () {

    var $aController, window, sce;
    var scopeMock,rootScopeMock,locationMock,offlineService,sessionServiceMock,appServiceMock,scheduledSyncMock;

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
        offlineService.isOfflineApp.and.returnValue(true);
        scheduledSyncMock = jasmine.createSpyObj('scheduledSync', ['jobInit','isJobRunning']);
        scheduledSyncMock.isJobRunning.and.returnValue(specUtil.createFakePromise());
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
            scheduledSync:scheduledSyncMock
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