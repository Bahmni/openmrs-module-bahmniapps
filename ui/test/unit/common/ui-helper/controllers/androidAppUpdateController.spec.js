'use strict';

describe("AppUpdateController", function () {
    beforeEach(module('bahmni.common.uiHelper'));
    var scope, controller, rootScope, offlineService, appInfoStrategy, ngDialog;

    beforeEach(inject(function ($controller, $rootScope) {
        controller = $controller;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        offlineService = jasmine.createSpyObj("offlineService", ["getItem"]);
        appInfoStrategy = jasmine.createSpyObj("appInfoStrategy", ["getVersion"]);
        ngDialog = jasmine.createSpyObj('ngDialog', ['open']);
    }));

    beforeEach(function () {
        controller("AppUpdateController", {
            $scope: scope,
            offlineService: offlineService,
            appInfoStrategy: appInfoStrategy,
            ngDialog: ngDialog
        });
    });

    it("should check if update available", function () {
        appInfoStrategy.getVersion.and.returnValue(0.82);
        offlineService.getItem.and.returnValue({compatibleVersions: [0.82, 0.83]});
        expect(scope.isUpdateAvailable()).toBeTruthy();
        offlineService.getItem.and.returnValue({compatibleVersions: [0.82]});
        expect(scope.isUpdateAvailable()).toBeFalsy();
    });
    
});