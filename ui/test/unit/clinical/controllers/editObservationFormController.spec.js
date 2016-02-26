'use strict';

describe("EditObservationFormController", function () {

    var scope, appService, appDescriptor, controller,_$window, rootScope, _$translate;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        scope.shouldPromptBrowserReload = true;
        scope.resetContextChangeHandler = function()  {};
        controller = $controller;
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        _$window = jasmine.createSpyObj('$window', ['confirm']);
        _$translate = jasmine.createSpyObj('$translate', ['instant']);
    }));


    var createController = function(appService){
        return controller('EditObservationFormController', {
            $scope: scope,
            appService: appService,
            $window:_$window,
            $rootScope:rootScope,
            $translate:_$translate
        });
    };

    describe("directivePreCloseCallback : when shouldPromptBeforeClose,config and hasVisitedConsultation are set to true", function () {
        it("if confirm return true then should return true and set shouldPromptBrowserReload to true ", function () {
            appDescriptor.getConfigValue.and.returnValue(true);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            createController(appService);
            rootScope.hasVisitedConsultation = true;
            _$window.confirm.and.returnValue(true);
            scope.shouldPromptBeforeClose = true;
            expect(scope.shouldPromptBrowserReload).toBeTruthy();
            expect(scope.directivePreCloseCallback()).toBeTruthy();
            expect(scope.shouldPromptBrowserReload).toBeTruthy();
        });
    });
    describe("directivePreCloseCallback :  when shouldPromptBeforeClose,config are true and hasVisitedConsultation is false", function () {
        it("if confirm return true then should return true and set shouldPromptBrowserReload to false ", function () {
            appDescriptor.getConfigValue.and.returnValue(true);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            createController(appService);
            rootScope.hasVisitedConsultation = false;
            _$window.confirm.and.returnValue(true);
            scope.shouldPromptBeforeClose = true;
            expect(scope.directivePreCloseCallback()).toBeTruthy();
            expect(scope.shouldPromptBrowserReload).toBeFalsy();
        });
    });
    describe("directivePreCloseCallback :  when shouldPromptBeforeClose,config are true and hasVisitedConsultation is false", function () {
        it("if confirm return false then should return false and set shouldPromptBrowserReload to true ", function () {
            appDescriptor.getConfigValue.and.returnValue(true);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            createController(appService);
            rootScope.hasVisitedConsultation = false;
            _$window.confirm.and.returnValue(false);
            scope.shouldPromptBeforeClose = true;
            expect(scope.directivePreCloseCallback()).toBeFalsy();
            expect(scope.shouldPromptBrowserReload).toBeTruthy();
        });
    });
    describe("directivePreCloseCallback :  when either shouldPromptBeforeClose or config are false", function () {
        it("should return undefined and set shouldPromptBrowserReload to true ", function () {
            appDescriptor.getConfigValue.and.returnValue(false);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            createController(appService);
            rootScope.hasVisitedConsultation = false;
            scope.shouldPromptBeforeClose = true;
            expect(scope.directivePreCloseCallback()).toBe(undefined);
            expect(scope.shouldPromptBrowserReload).toBeTruthy();
        });
    });

});