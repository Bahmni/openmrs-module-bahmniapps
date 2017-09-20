'use strict';

describe('AppointmentsManageController', function () {
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
        controller('AppointmentsManageController', {
            $scope: scope,
            appService: appService,
            $location: location,
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
        scope.navigateTo('summary');
        expect(location.url).toHaveBeenCalledWith('/home/manage/summary');
    });

    it("should navigate to appointments tab calendar view if configured", function () {
        scope.navigateTo('appointments');
        expect(location.url).toHaveBeenCalledWith('/home/manage/appointments/calendar');
    });

    it("should navigate to appointments tab list view if calendar view is not configured", function () {
        appDescriptor.getConfigValue.and.returnValue(false);
        createController();
        scope.navigateTo('appointments');
        expect(location.url).toHaveBeenCalledWith('/home/manage/appointments/list');
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
