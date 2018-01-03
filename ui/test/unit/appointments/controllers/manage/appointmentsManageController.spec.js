'use strict';

describe('AppointmentsManageController', function () {
    var controller, scope, state, appService, appDescriptor;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller;
            state = jasmine.createSpyObj('$state', ['go']);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            appDescriptor.getConfigValue.and.returnValue(true);
        });
    });

    var createController = function () {
        controller('AppointmentsManageController', {
            $scope: scope,
            appService: appService,
            $state: state
        });
    };

    beforeEach(function () {
        createController();
    });

    it("should initialize enable calendar view from config", function () {
        expect(scope.enableCalendarView).toBeTruthy();
    });

    it("should navigate to summary tab", function () {
        state.params = {};
        scope.navigateTo('summary');
        expect(state.go).toHaveBeenCalledWith('home.manage.summary', state.params, {reload: false});
    });

    it("should navigate to appointments tab calendar view if configured", function () {
        state.params = {};
        scope.navigateTo('appointments');
        expect(state.go).toHaveBeenCalledWith('home.manage.appointments.calendar', state.params, {reload: false});
    });

    it("should navigate to appointments tab list view if calendar view is not configured", function () {
        appDescriptor.getConfigValue.and.returnValue(false);
        createController();
        state.params = {};
        scope.navigateTo('appointments');
        expect(state.go).toHaveBeenCalledWith('home.manage.appointments.list', state.params, {reload: false});
    });

    it('should get tabName from state.current', function () {
        state = {
            name: "home.manage.summary",
            url: '/summary',
            current: {
                tabName: 'summary'
            }
        };
        createController();
        var tabName = scope.getCurrentTabName();
        expect(tabName).toBe('summary');
    })
});
