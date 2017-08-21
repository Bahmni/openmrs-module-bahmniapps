'use strict';

describe('AllAppointmentsController', function () {
    var controller, scope, state, location, appService, appDescriptor;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, $state) {
            scope = $rootScope.$new();
            controller = $controller;
            state = $state;
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            location = jasmine.createSpyObj('$location', ['url']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            appDescriptor.getConfigValue.and.returnValue(true);
        });
    });

    var createController = function () {
        controller('AllAppointmentsController', {
            $scope: scope,
            appService: appService,
            $location: location,
            $state: state
        });
    };

    it("should initialize enable calendar view from config", function () {
        createController();
        expect(scope.enableCalendarView).toBeTruthy();
    });

    it("should navigate to calendar view if calendar button in pressed", function () {
        createController();
        scope.navigateTo('calendar');
        expect(location.url).toHaveBeenCalledWith('/home/manage/appointments/calendar');
    });

    it("should navigate to list view if list button is pressed", function () {
        createController();
        scope.navigateTo('list');
        expect(location.url).toHaveBeenCalledWith('/home/manage/appointments/list');
    });

    it("should get tabName from state.current", function () {
        state = {
            name: "home.manage.appointments.calendar",
            url: '/calendar',
            current: {
                tabName: 'calendar'
            }
        };
        createController();
        var tabName = scope.getCurrentAppointmentTabName();
        expect(tabName).toBe("calendar");
    });
});
