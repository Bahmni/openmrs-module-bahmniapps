'use strict';

describe("BedManagementController", function() {
    var  wardService, createController, scope;
    var bedService, sessionService, encounterService;
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
        inject(function($controller, $rootScope, _WardService_, _bedService_, _sessionService_, _encounterService_) {
            scope = $rootScope.$new();
            wardService = _WardService_;
            bedService = _bedService_;
            sessionService = _sessionService_;
            encounterService = _encounterService_;
            createController = function() {
                return $controller("BedManagementController", {
                    $scope: scope,
                    bedService: bedService,
                    $stateParams:{encounterUuid : "encounter uuid"}
                });
            };
        });
    });

    it("should call the ward service to retrieve the ward list", function() {
        var callback = spyOn(wardService, 'getWardsList').and.callThrough();
        createController();
        expect(wardService.getWardsList).toHaveBeenCalled();
    });

});
