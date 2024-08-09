'use strict';

describe("CareViewController", function () {
    var scope, controller, auditLogService, sessionService, $window;
    var state = jasmine.createSpyObj('$state', ['go']);
    beforeEach(module('bahmni.ipd'));
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
    let mockUser = { name: "__test__user" }
    var createController = function () {

        controller('CareViewController', {
            $scope: scope,
            $rootScope: {currentProvider: mockProvider, quickLogoutComboKey: 'Escape', cookieExpiryTime:30, currentUser: mockUser},
            $state: state,
            auditLogService: auditLogService,
            sessionService: sessionService,
            $window: $window
        });
    };

    it('should create host data and host api', function (){
        createController();
        expect(scope.hostData).toEqual({provider: mockProvider, currentUser: mockUser});
        expect(scope.hostApi).not.toBeNull();
    });

    it('should call onHome when hostApi.onHome is called', function () {
        createController();
        scope.hostApi.onHome();
        expect(state.go).toHaveBeenCalledWith('home');
    });

    it('should call auditLogService.log and sessionService.destroy on logout', function () {
        createController();
        scope.hostApi.onLogOut();
        expect(auditLogService.log).toHaveBeenCalledWith(undefined, 'USER_LOGOUT_SUCCESS', undefined, 'MODULE_LABEL_LOGOUT_KEY');
        expect(sessionService.destroy).toHaveBeenCalled();
    });

    it('should call auditLogService.log while handleAuditEvent is triggered', function (){
        createController();
        scope.hostApi.handleAuditEvent(undefined, 'VIEWED_WARD_LEVEL_DASHBOARD', undefined, 'MODULE_LABEL_INPATIENT_KEY');
        expect(auditLogService.log).toHaveBeenCalledWith(undefined, 'VIEWED_WARD_LEVEL_DASHBOARD', undefined, 'MODULE_LABEL_INPATIENT_KEY');
    });

    it('should call handleLogoutShortcut on keydown event', function (){
        createController();
        spyOn(scope.hostApi, 'onLogOut');
        $window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape', 'metaKey': true, 'ctrlKey': false}));
        expect(scope.hostApi.onLogOut).toHaveBeenCalled();
    });

    it('should call handleLogoutShortcut on keydown event', function (){
        createController();
        spyOn(scope.hostApi, 'onLogOut');
        $window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape', 'metaKey': false, 'ctrlKey': true}));
        expect(scope.hostApi.onLogOut).toHaveBeenCalled();
    });

    it('should call handleLogoutShortcut on keydown event', function (){
        createController();
        spyOn(scope.hostApi, 'onLogOut');
        $window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape', 'metaKey': false, 'ctrlKey': false}));
        expect(scope.hostApi.onLogOut).not.toHaveBeenCalled();
    });

    it('should remove event listener on scope destroy', function () {
        spyOn($window, 'removeEventListener');
        createController();
        scope.$destroy();
        expect($window.removeEventListener).toHaveBeenCalledWith('keydown', jasmine.any(Function));
    });
});
