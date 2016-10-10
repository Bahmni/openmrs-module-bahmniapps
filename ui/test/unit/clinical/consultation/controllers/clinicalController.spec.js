'use strict';

describe('ClinicalController', function () {
    var scope, controller, rootScope;
    var mockRetrospectiveEntryService= jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveEntry']);
    var appService= jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var mockAppDescriptor = jasmine.createSpyObj('appService', ['getConfigValue']);
    mockAppDescriptor.getConfigValue.and.returnValue(undefined);

    var mockAppService = jasmine.createSpyObj('appDescriptor', ['getAppDescriptor']);
    mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);

    beforeEach(function () {
        module('bahmni.clinical');
        var config =  {
                "locales" : [
                { "locale" : "fr", "css" : "offline-language-french"},
                { "locale" : "es", "css": "offline-language-spanish"},
                { "locale" : "pt", "css": "offline-language-portuguese-brazil"}
            ]
        };
        mockRetrospectiveEntryService.getRetrospectiveEntry.and.returnValue();
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (value) {
                return config;
            }
        });
        module(function ($provide) {
            $provide.value('appService', appService);
        });

        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
            rootScope = $rootScope;
        });
    });

    function createController() {
        return controller('ClinicalController', {
            $scope: scope,
            $rootScope:rootScope,
            retrospectiveEntryService:mockRetrospectiveEntryService
        });
    }


    describe('retrospectiveClass', function () {
        it("should make a call to retrospectiveEntryService.getRetrospectiveEntry", function () {
            createController();
            scope.retrospectiveClass();
            expect(mockRetrospectiveEntryService.getRetrospectiveEntry).toHaveBeenCalled();
        });
        it("should return false if retrospectiveEntryService.getRetrospectiveEntry return empty value ", function () {
            createController();
            expect(scope.retrospectiveClass()).toBeFalsy();
        });
    });

    describe('toggleControlPanel', function () {
        it("should toggle rootscope.showControlPanel", function () {
            createController();
            expect(rootScope.showControlPanel).toBe(undefined)
            rootScope.toggleControlPanel();
            expect(rootScope.showControlPanel).toBeTruthy();
        });
    });
    describe('collapseControlPanel', function () {
        it("should set rootscope.showControlPanel to false", function () {
            createController();
            rootScope.toggleControlPanel();
            expect(rootScope.showControlPanel).toBeTruthy()
            rootScope.collapseControlPanel();
            expect(rootScope.showControlPanel).toBeFalsy();
        });
    });

    describe('getLocaleCSS', function () {
        it("should return default css if current user locale is not defined", function () {
            createController();
            rootScope.currentUser = {
                userProperties :{

                }
            };
            expect(scope.getLocaleCSS()).toBe("offline-language-english");

            rootScope.currentUser = {
            };
            expect(scope.getLocaleCSS()).toBe("offline-language-english");

            rootScope = {};
            expect(scope.getLocaleCSS()).toBe("offline-language-english");
        });
        it("should return css corresponding to current user locale ", function () {
            createController();
            rootScope.currentUser = {
                userProperties :{
                    defaultLocale : "fr"
                }
            };
            expect( scope.getLocaleCSS()).toBe("offline-language-french");
        });
    });
});