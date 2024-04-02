'use strict';

describe("CareViewController", function () {
    var scope, controller, auditLogService, sessionService;
    var state = jasmine.createSpyObj('$state', ['go']);
    beforeEach(module('bahmni.adt'));
    beforeEach(inject(function ($controller, $rootScope) {
        controller = $controller;
        scope = $rootScope.$new();
    }));
    auditLogService = jasmine.createSpyObj('auditLogService', ['log']);
    sessionService = jasmine.createSpyObj('sessionService', ['destroy']);
    auditLogService.log.and.returnValue({
        then: function(callback) { return callback(); }
    });
    sessionService.destroy.and.returnValue({
        then: function() { }
    });
    let mockProvider = {name: "__test__provider"}
    var createController = function () {

        controller('CareViewController', {
            $scope: scope,
            $rootScope: {currentProvider: mockProvider},
            $state: state,
            auditLogService: auditLogService,
            sessionService: sessionService
        });
    };
    it('should create host data and host api', function (){
        createController();
        expect(scope.hostData).toEqual({provider: mockProvider});
        expect(scope.hostApi).not.toBeNull();
    })
    it('should call auditLogService.log and sessionService.destroy on logout', function (){
        createController();
        scope.hostApi.onLogOut();
        expect(auditLogService.log).toHaveBeenCalled();
        expect(sessionService.destroy).toHaveBeenCalled();
    });
});