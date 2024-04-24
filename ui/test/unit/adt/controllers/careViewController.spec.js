'use strict';

describe("CareViewController", function () {
    var scope, controller, auditLogService, sessionService, $window;
    var state = jasmine.createSpyObj('$state', ['go']);
    beforeEach(module('bahmni.adt'));
    beforeEach(inject(function ($controller, $rootScope,_$window_) {
        controller = $controller;
        scope = $rootScope.$new();
        $window = _$window_;
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
            $rootScope: {currentProvider: mockProvider, quickLogoutComboKey: 'Escape'},
            $state: state,
            auditLogService: auditLogService,
            sessionService: sessionService,
            $window: $window
        });
    };
    it('should create host data and host api', function (){
        createController();
        expect(scope.hostData).toEqual({provider: mockProvider});
        expect(scope.hostApi).not.toBeNull();
    });
    it('should call auditLogService.log and sessionService.destroy on logout', function (){
        createController();
        scope.hostApi.onLogOut();
        expect(auditLogService.log).toHaveBeenCalled();
        expect(sessionService.destroy).toHaveBeenCalled();
    });
    it('should call handleLogoutShortcut on keydown event', function (){
        createController();
        spyOn(scope.hostApi, 'onLogOut');
        $window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape', 'metaKey': true, 'ctrlKey': false}));
        expect(scope.hostApi.onLogOut).toHaveBeenCalled();
    });
});
