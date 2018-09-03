'use strict';

describe('AppointmentsDayCalendarController', function () {
    var element,controller, scope, rootScope, appService, appDescriptor, $compile, httpBackend, $state, calendarViewPopUp;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, _$compile_, _$httpBackend_) {
            controller = $controller;
            $compile = _$compile_;
            httpBackend = _$httpBackend_;
            httpBackend.expectGET('../i18n/appointments/locale_en.json').respond({});
            httpBackend.expectGET('/bahmni_config/openmrs/i18n/appointments/locale_en.json').respond({});
            scope = $rootScope.$new();
            rootScope = $rootScope;
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            $state = jasmine.createSpyObj('$state', ['go']);
            calendarViewPopUp = jasmine.createSpy('calendarViewPopUp');
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
            $rootScope: rootScope,
            appService: appService,
            $state: $state,
            calendarViewPopUp: calendarViewPopUp
        });
    };

    beforeEach(function () {
        scope.appointments = {events: [{title: 'event1'}]};
    });

    it('should init events and eventSources and uiConfig with default values if not configured', function () {
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
        var startOfDay = '00:08:30';
        var endOfDay = '00:17:30';
        var calendarSlotDuration = '00:10';
        var calendarSlotLabelInterval = '00:12';
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

    it('should not be selectable if date is a past date', function () {
        scope.date = new Date('1970-01-01T11:30:00.000Z');
        createController();
        expect(scope.uiConfig.calendar.selectable).toBe(false)
    });

    it('should be selectable if date is today', function () {
        scope.date = moment().startOf('day');
        createController();
        expect(scope.uiConfig.calendar.selectable).toBe(true)
    });

    it('should be selectable if date is future date', function () {
        scope.date = moment().add(1, 'year').toDate();
        createController();
        expect(scope.uiConfig.calendar.selectable).toBe(true)
    });

    it('should go to new appointment state on createAppointment even if the user has Manage privilege', function () {
        rootScope.currentUser = {privileges: [{name: Bahmni.Appointments.Constants.privilegeManageAppointments}]};
        createController();
        var startDateTime = moment();
        var endDateTime = moment().add(30, 'minutes');
        var resource = {id: 'Superman', title: 'Superman', provider: {name: "Superman", uuid: "7d162c29-3f12-11e4-adec-0800271c1b75"}};
        $state.params = {};
        scope.createAppointment(startDateTime, endDateTime, undefined, undefined, resource);
        expect($state.go).toHaveBeenCalledWith('home.manage.appointments.calendar.new',
            $state.params,{reload:false});
    });

    it('should go to new appointment state on createAppointment even if the current user has selfManage privilege and current user is the provider', function () {
        rootScope = {
            currentUser: {privileges: [{name: Bahmni.Appointments.Constants.privilegeSelfAppointments}]},
            currentProvider: {uuid: 'currentUserUuid'}
        };
        createController();
        $state.params = {};
        var resource = {provider: {uuid: 'currentUserUuid'}};

        scope.createAppointment(null, null, undefined, undefined, resource);

        expect($state.go).toHaveBeenCalledWith('home.manage.appointments.calendar.new',
            $state.params, {reload: false});
    });

    it('should go to new appointment state on createAppointment even if the current user has selfManage privilege and the appointment has no provider', function () {
        rootScope = {
            currentUser: {privileges: [{name: Bahmni.Appointments.Constants.privilegeSelfAppointments}]},
            currentProvider: {uuid: 'currentUserUuid'}
        };
        createController();
        $state.params = {};
        var resource = {provider: {uuid: 'no-provider-uuid'}};

        scope.createAppointment(null, null, undefined, undefined, resource);

        expect($state.go).toHaveBeenCalledWith('home.manage.appointments.calendar.new',
            $state.params, {reload: false});
    });

    it('should go to new appointment state on createAppointment if resource is undefined', function () {
        var resource = undefined;
        $state.params = {};
        createController();

        scope.createAppointment(null, null, undefined, undefined, resource);

        expect($state.go).toHaveBeenCalledWith('home.manage.appointments.calendar.new',
            $state.params, {reload: false});
    });


    it('should not go to new appointment state on createAppointment if the user does not have Manage privilege', function () {
        rootScope.currentUser = {privileges: []};
        createController();
        expect($state.go).not.toHaveBeenCalled();
    });

    it('should call calendarView pop up on eventClick with appointments and enableCreateAppointment true for current date', function () {
        createController();
        scope.date = moment().toDate();
        var event = {appointments: []};
        scope.alertOnEventClick(event);
        expect(calendarViewPopUp).toHaveBeenCalledWith({
            scope : { appointments : event.appointments, checkinAppointment : jasmine.any(Function), enableCreateAppointment : true },
            className: "ngdialog-theme-default delete-program-popup app-dialog-container"
        });
    });

    it('should call calendarView pop up on eventClick with appointments and enableCreateAppointment true for future date', function () {
        createController();
        scope.date = moment().add(1, 'day').toDate();
        var event = {appointments: []};
        scope.alertOnEventClick(event);
        expect(calendarViewPopUp).toHaveBeenCalledWith({
            scope : { appointments : event.appointments, checkinAppointment : jasmine.any(Function), enableCreateAppointment : true },
            className: "ngdialog-theme-default delete-program-popup app-dialog-container"
        });
    });

    it('should call calendarView pop up on eventClick with appointments and enableCreateAppointment false for past dates', function () {
        createController();
        scope.date = moment().subtract(1, 'day').toDate();
        var event = {appointments: []};
        scope.alertOnEventClick(event);
        expect(calendarViewPopUp).toHaveBeenCalledWith({
            scope : { appointments : event.appointments, checkinAppointment : jasmine.any(Function), enableCreateAppointment : false },
            className: "ngdialog-theme-default delete-program-popup app-dialog-container"
        });
    });

    it('should reset the event and resources when appointments has been changed', function () {
        var startDateTime = moment();
        var endDateTime = moment().add(30, 'minutes');
        var resource = {id: 'Superman', title: 'Superman', provider: {name: "Superman", uuid: "7d162c29-3f12-11e4-adec-0800271c1b75"}};
        var appointment =  {startDateTime: startDateTime, endDateTime: endDateTime, provider: resource.provider};
        createController();
        scope.appointments ={};
        scope.uiConfig.calendar.resources = [{id: 'Jane', title: 'Jane'},
            {id: 'Austen', title: 'Austen'}];
        scope.$digest();

        var event = { appointmentKind:"Scheduled",  title: "new patient(GAN203007)"};
        scope.appointments = {events: [event], resources: [{id: 'Jane', title: 'Jane'}]};
        scope.$digest();
        expect(scope.uiConfig.calendar.resources).toEqual(scope.appointments.resources);
        expect(scope.eventSources).toEqual([scope.appointments.events]);

    })
});
