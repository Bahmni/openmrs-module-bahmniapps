'use strict';

describe("EditObservationFormController", function () {

    var scope, appService, appDescriptor, controller,_$window;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        scope.shouldPromptBrowserReload = true;
        controller = $controller;
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        _$window = jasmine.createSpyObj('$window', ['confirm']);
    }));


    var createController = function(appService){
        return controller('EditObservationFormController', {
            $scope: scope,
            appService: appService,
            $window:_$window
        });
    };

    describe("directivePreCloseCallback", function(){
        it("should return true  and set shouldPromptBrowserReload if both shouldPromptReload and config are set to true", function () {
            appDescriptor.getConfigValue.and.returnValue({"showSaveConfirmDialog":true});
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            createController(appService);
            _$window.confirm.and.returnValue(true);
            scope.shouldPromptBeforeReload = true;
            expect(scope.shouldPromptBrowserReload).toBeTruthy();
            expect(scope.directivePreCloseCallback()).toBeTruthy();
            expect(scope.shouldPromptBrowserReload).toBeFalsy();
        });
        it("should return false if both shouldPromptReload and config are set to true and confirm returns false", function () {
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appDescriptor.getConfigValue.and.returnValue(true);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            createController(appService);
            _$window.confirm.and.returnValue(false);
            scope.shouldPromptBeforeReload = true;
            expect(scope.directivePreCloseCallback()).toBe(false);
        });
        it("should return true if both shouldPromptReload and config are set to true", function () {
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appDescriptor.getConfigValue.and.returnValue(false);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            createController(appService);
            scope.shouldPromptBeforeReload = false;
            expect(scope.directivePreCloseCallback()).toBe(undefined);
        });
    });

});