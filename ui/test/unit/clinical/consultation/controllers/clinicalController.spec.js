'use strict';

describe('ClinicalController', function () {
    var scope, controller, rootScope;
    var mockRetrospectiveEntryService= jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveEntry']);

    beforeEach(function () {
        module('bahmni.clinical');
        mockRetrospectiveEntryService.getRetrospectiveEntry.and.returnValue();
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
});