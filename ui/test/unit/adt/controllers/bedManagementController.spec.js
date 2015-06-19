'use strict';

describe("BedManagementController", function() {
    var  wardService, createController, scope, rootScope;
    var bedService, sessionService, encounterService, mockBackend;
    beforeEach(function() {
        module('bahmni.adt');

        module(function($provide) {
            $provide.value('bedService', {});
        });
        module(function($provide) {
            $provide.value('sessionService', {});
        });
        module(function($provide) {
            $provide.value('encounterService', {});
        });

    });

    beforeEach(function() {
        inject(function($controller, $rootScope, _WardService_, _bedService_, _sessionService_, _encounterService_, $httpBackend) {
            scope = $rootScope.$new();
            rootScope = $rootScope;
            wardService = _WardService_;
            bedService = _bedService_;
            sessionService = _sessionService_;
            encounterService = _encounterService_;
            mockBackend = $httpBackend;
            createController = function() {
                return $controller("BedManagementController", {
                    $scope: scope,
                    bedService: bedService,
                    $stateParams:{encounterUuid : "encounter uuid"}
                });
            };
        });
    });

    beforeEach(function() {
        createController();
    });
    describe('initialization of controller with bedDetails on rootScope undefined', function () {
        it("should call the ward service to retrieve the ward list", function () {
            var callback = spyOn(wardService, 'getWardsList').and.callThrough();
            createController();
            expect(wardService.getWardsList).toHaveBeenCalled();
        });
    });

    describe('initialization of controller with bedDetails on rootScope defined', function () {
        it("should call the ward service to retrieve the beds for a ward", function () {
            var callback = spyOn(wardService, 'bedsForWard').and.callThrough();
            rootScope.bedDetails={ wardUuid : "wardUuid", wardName :"name"};
            createController();
            expect(wardService.bedsForWard).toHaveBeenCalled();
        });
    });

    describe('showWardList', function () {
        it("should set the value of current view to ward list", function () {
            scope.showWardList();
            expect(scope.currentView).toBe("wardList");
        });
    });

    describe('showWardLayout : Selecting bed from the ward layout', function () {
        it("should set the value of current ward name and current view to wardLayout", function () {
            scope.showWardLayout("uuid", "name");
            expect(scope.currentView).toBe("wardLayout");
        });
    });

    describe('hide bed info pop up', function () {
        it("should set the value of selected bed to null", function () {
            mockBackend.expectGET('/openmrs/ws/rest/v1/admissionLocation').respond([]);
            scope.selectedBed={bedId:2};
            scope.hideBedInfoPopUp();
            expect(scope.selectedBed).toBe(null);
        });
    });

});
