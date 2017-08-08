'use strict';

describe('AllAppointmentsController', function () {
    var controller, scope, location, appService, appDescriptor;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller;
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
            $location: location
        });
    };

    it("should initialize enable calendar view from config", function () {
        createController();
        expect(scope.enableCalendarView).toBeTruthy();
    });

    it("should navigate to appointments tab calendar view if configured", function () {
        createController();
        scope.navigateTo('appointments');
        expect(scope.currentTab).toBe('appointments');
        expect(location.url).toHaveBeenCalledWith('/home/manage/appointments/calendar');
    });

    it("should navigate to appointments tab list view if calendar view is not configured", function () {
        appDescriptor.getConfigValue.and.returnValue(false);
        createController();
        scope.navigateTo('appointments');
        expect(scope.currentTab).toBe('appointments');
        expect(location.url).toHaveBeenCalledWith('/home/manage/appointments/list');
    });
});
