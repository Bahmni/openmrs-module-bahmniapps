'use strict';

describe("BedManagementController", function () {
    var wardService;
    var sessionService = jasmine.createSpyObj('sessionService', ['']);
    var backlinkService = jasmine.createSpyObj('backlinkService', ['addUrl']);
    var scope, rootScope, controller;

    beforeEach(function () {
        module('bahmni.adt');

        inject(function ($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
        });
    });

    function createController() {
        return controller("BedManagementController", {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: {encounterUuid: "encounter uuid"},
            wardService: wardService,
            backlinkService: backlinkService
        });
    }

    beforeEach(function() {
        wardService = jasmine.createSpyObj('wardService', ['getWardsList']);
        var getWardsListPromise = specUtil.createServicePromise('getWardsList');
        getWardsListPromise.success = function(successFn) {
            successFn({results: []});
            return getWardsListPromise;
        };
        wardService.getWardsList.and.returnValue(getWardsListPromise);
    });

    describe('initialization of controller with bedDetails on rootScope undefined', function () {
        it("should call the ward service to retrieve the ward list", function () {
            createController();
            expect(wardService.getWardsList).toHaveBeenCalled();
            expect(scope.wards).not.toBeUndefined();
        });
    });

    describe('watch', function () {
        it('should reload if bed assigment changes', function () {
            rootScope.bedDetails = {wardUuid: 'something'};

            createController();
            scope.$digest();
            rootScope.bedDetails = {wardUuid: 'warduuid1'};
            scope.$digest();
            expect(wardService.getWardsList.calls.count()).toBe(2);
        });
    });

});
