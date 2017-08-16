'use strict';

describe('AppointmentsDayCalendarController', function () {
    var element,controller, scope, appService, appDescriptor, $compile, httpBackend;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, _$compile_, _$httpBackend_) {
            controller = $controller;
            $compile = _$compile_;
            httpBackend = _$httpBackend_;
            httpBackend.expectGET('../i18n/appointments/locale_en.json').respond({});
            httpBackend.expectGET('/bahmni_config/openmrs/i18n/appointments/locale_en.json').respond({});
            scope = $rootScope.$new();
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
        });
    });


    var createElement = function () {
        document.body.innerHTML += '<div class="app-calendar-container"></div>';
        element = angular.element("<div class=\"app-calendar-container\">");
        $compile(element)(scope);
        scope.$digest();
    };

    var createController = function () {
        createElement();
        controller('AppointmentsDayCalendarController', {
            $scope: scope,
            appService: appService
        });
    };

    it('should init events and eventSources and uiConfig with default values if not configured', function () {
        scope.appointments = {events: [{title: 'event1'}]};
        expect(scope.events).toBeUndefined();
        createController();
        expect(scope.events).toEqual(scope.appointments.events);
        expect(scope.eventSources).toEqual([scope.events]);
        expect(scope.uiConfig.calendar.defaultDate).toBe(scope.date);
        expect(scope.uiConfig.calendar.businessHours.start).toBe(Bahmni.Appointments.Constants.defaultCalendarStartTime);
        expect(scope.uiConfig.calendar.businessHours.end).toBe(Bahmni.Appointments.Constants.defaultCalendarEndTime);
        expect(scope.uiConfig.calendar.slotDuration).toBe(Bahmni.Appointments.Constants.defaultCalendarSlotDuration);
        expect(scope.uiConfig.calendar.slotLabelInterval).toBe(Bahmni.Appointments.Constants.defaultCalendarSlotLabelInterval);
    });

    it('should init uiConfig with configured values', function () {
        scope.appointments = {events: [{title: 'event1'}]};
        var startOfDay = '00:08:30';
        var endOfDay = '00:17:30';
        var calendarSlotDuration = '00:10:00';
        var calendarSlotLabelInterval = '00:12:00';
        appDescriptor.getConfigValue.and.callFake(function (key) {
            if (key === 'startOfDay') {
                return startOfDay;
            } else if (key === 'endOfDay') {
                return endOfDay;
            } else if (key === 'calendarSlotDuration') {
                return calendarSlotDuration;
            } else if (key === 'calendarSlotLabelInterval') {
                return calendarSlotLabelInterval;
            }
        });
        scope.date = new Date('1970-01-01T11:30:00.000Z');
        createController();
        expect(scope.uiConfig.calendar.defaultDate).toBe(scope.date);
        expect(scope.uiConfig.calendar.businessHours.start).toBe(startOfDay);
        expect(scope.uiConfig.calendar.businessHours.end).toBe(endOfDay);
        expect(scope.uiConfig.calendar.slotDuration).toBe(calendarSlotDuration);
        expect(scope.uiConfig.calendar.slotLabelInterval).toBe(calendarSlotLabelInterval);
    });
});
