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
            expect(scope.wards).not.toBeUndefined();
        });
    });

});
