'use strict';

describe('AllAppointmentsController', function () {
    var controller, scope, state, appService, appDescriptor;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller;
            state = jasmine.createSpyObj('state', ['go']);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            appDescriptor.getConfigValue.and.returnValue(true);
        });
    });

    var createController = function () {
        controller('AllAppointmentsController', {
            $scope: scope,
            $state: state,
            appService: appService
        });
    };
    it("should initialize enable calendar view from config", function () {
        createController();
        expect(scope.enableCalendarView).toBeTruthy();
    });

    it("should navigate to calendar view if calendar button in pressed", function () {
        state.params = {filterParams: {serviceUuids: ['serviceUuid1']}};
        createController();
        scope.navigateTo('calendar');
        expect(state.go).toHaveBeenCalledWith('home.manage.appointments.calendar', state.params, {reload: false});
    });

    it("should navigate to list view if list button is pressed", function () {
        state.params = {filterParams: {serviceUuids: ['serviceUuid1']}};
        createController();
        scope.navigateTo('list');
        expect(state.go).toHaveBeenCalledWith('home.manage.appointments.list', state.params, {reload: false});
    });

    it("should get tabName from state.current", function () {
        state.current = {tabName : 'calendar'};
        createController();
        var tabName = scope.getCurrentAppointmentTabName();
        expect(tabName).toBe("calendar");
    });

});
