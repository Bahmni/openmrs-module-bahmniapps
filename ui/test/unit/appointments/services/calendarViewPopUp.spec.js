'use strict';

describe('CalendarViewPopUp', function () {
    var rootScope, calendarViewPopUp, popUpScope, ngDialog, $state, confirmBox, $translate, appointmentsService;

    beforeEach(function () {
        module('bahmni.appointments');
        module(function ($provide) {
            popUpScope = {};
            ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
            $state = jasmine.createSpyObj('$state', ['go']);
            confirmBox = jasmine.createSpy('confirmBox');
            $translate = jasmine.createSpyObj('$translate', ['instant', 'storageKey', 'storage', 'preferredLanguage']);
            appointmentsService = jasmine.createSpyObj('appointmentsService', ['changeStatus']);

            $provide.value('ngDialog', ngDialog);
            $provide.value('$state', $state);
            $provide.value('confirmBox', confirmBox);
            $provide.value('$translate', $translate);
            $provide.value('appointmentsService', appointmentsService);
        });
    });

    beforeEach(inject(['$rootScope', 'calendarViewPopUp', function ($rootScope, _calendarViewPopUp_) {
        rootScope = $rootScope;
        calendarViewPopUp = _calendarViewPopUp_;
    }]));

    beforeEach(function () {
        spyOn(rootScope, '$new');
        rootScope.$new.and.returnValue(popUpScope);
    });

    it('construct patients list and group appointments by patients', function () {
        var appointments = [
            {
                patient: {identifier: "GAN203012", name: "patient1", uuid: "03dba27a-dbd3-464a-8713-24345aa51e1e"}
            },
            {
                patient: {identifier: "GAN102018", name: "patient2", uuid: "96a2b38c-18d8-4603-94cd-e2f806251870"}
            }
        ];
        var config = {scope: {appointments: appointments}};
        calendarViewPopUp(config);
        expect(popUpScope.scope.patientList).toEqual([appointments[0].patient, appointments[1].patient]);
        expect(popUpScope.scope.patientAppointmentMap[appointments[0].patient.uuid]).toBe(appointments[0]);
        expect(popUpScope.scope.patientAppointmentMap[appointments[1].patient.uuid]).toBe(appointments[1]);
        expect(popUpScope.patient).toBeUndefined();
    });

    it('should assign patient when there is a single appointment', function () {
        var appointments = [
            {
                patient: {identifier: "GAN203012", name: "patient1", uuid: "03dba27a-dbd3-464a-8713-24345aa51e1e"}
            }
        ];
        var config = {scope: {appointments: appointments}};
        calendarViewPopUp(config);
        expect(popUpScope.patient).toBe(appointments[0].patient);
    });

    it('should open ngDialog with properties', function () {
        var config = {scope: {appointments: []}};
        calendarViewPopUp(config);
        expect(ngDialog.open).toHaveBeenCalledWith({
            template: '../appointments/views/manage/calendar/popUp.html',
            scope: popUpScope,
            className: 'ngdialog-theme-default',
            preCloseCallback: jasmine.any(Function)
        });
    });

    it('preCloseCallBack should reload current state', function () {
        popUpScope.$destroy = jasmine.createSpy('$destroy');
        ngDialog.open.and.callFake(function (params) {
            params.preCloseCallback();
            expect($state.go).toHaveBeenCalledWith($state.current, $state.params, {reload: true});
            expect(popUpScope.$destroy).toHaveBeenCalled();
        });
        var config = {scope: {appointments: []}};
        calendarViewPopUp(config);
    });

    it('should go to new appointment state on createAppointment', function () {
        $state.params = {};
        var appointments = [{
            startDateTime: moment(),
            endDateTime: moment().add(30, 'minutes'),
            provider: {name: 'Superman'},
            patient: {uuid: 'patientUuid'}
        }];
        var config = {scope: {appointments: appointments}};
        calendarViewPopUp(config);
        popUpScope.createAppointment();
        expect(ngDialog.close).toHaveBeenCalled();
        expect($state.params.appointment).toEqual({
            startDateTime: appointments[0].startDateTime,
            endDateTime: appointments[0].endDateTime,
            provider: appointments[0].provider,
            appointmentKind: 'Scheduled'
        });
        expect($state.go).toHaveBeenCalledWith('home.manage.appointments.calendar.new', $state.params, {reload: false});
    });

    it('should go to edit appointment state on editAppointment', function () {
        $state.params = {};
        var appointment = {uuid: 'appointUuid'};
        var config = {scope: {appointments: []}};
        calendarViewPopUp(config);
        popUpScope.editAppointment(appointment);
        expect(ngDialog.close).toHaveBeenCalled();
        expect($state.params.uuid).toBe(appointment.uuid);
        expect($state.go).toHaveBeenCalledWith('home.manage.appointments.calendar.edit', $state.params, {reload: false});
    });

    it('should show a pop up on confirmAction', function () {
        var appointment = {uuid: 'appointmentUuid'};
        var toStatus = 'Completed';
        var onDate = new Date();
        var translatedMessage = 'Are you sure you want change status to ' + toStatus + '?';
        $translate.instant.and.returnValue(translatedMessage);
        confirmBox.and.callFake(function (config) {
            expect($translate.instant).toHaveBeenCalledWith('APPOINTMENT_STATUS_CHANGE_CONFIRM_MESSAGE', {toStatus: toStatus});
            expect(config.scope.message).toEqual(translatedMessage);
            expect(config.scope.no).toEqual(jasmine.any(Function));
            expect(config.scope.yes).toEqual(jasmine.any(Function));
            expect(config.actions).toEqual([{name: 'yes', display: 'YES_KEY'}, {name: 'no', display: 'NO_KEY'}]);
            expect(config.className).toEqual('ngdialog-theme-default');
        });
        var config = {scope: {appointments: []}};
        calendarViewPopUp(config);
        popUpScope.confirmAction(appointment, toStatus, onDate);
        expect(confirmBox).toHaveBeenCalled();
    });

    it('should change status on confirmation on confirmAction', function () {
        var appointment = {uuid: 'appointmentUuid', status: 'Scheduled'};
        var toStatus = 'Cancelled';
        appointmentsService.changeStatus.and.returnValue(specUtil.simplePromise({}));
        confirmBox.and.callFake(function (config) {
            var close = jasmine.createSpy('close');
            config.scope.yes(close).then(function () {
                expect(appointmentsService.changeStatus).toHaveBeenCalledWith(appointment.uuid, toStatus, undefined);
                expect(appointment.status).toBe(toStatus);
                expect(close).toHaveBeenCalled();
            });
        });
        var config = {scope: {appointments: []}};
        calendarViewPopUp(config);
        popUpScope.confirmAction(appointment, toStatus);
    });

    it('should call passed function on cancel on confirmAction', function () {
        var appointment = {uuid: 'appointmentUuid', status: 'CheckedIn'};
        var toStatus = 'Completed';
        confirmBox.and.callFake(function (config) {
            var close = jasmine.createSpy('close');
            config.scope.no(close);
            expect(close).toHaveBeenCalled();
        });
        var config = {scope: {appointments: []}};
        calendarViewPopUp(config);
        popUpScope.confirmAction(appointment, toStatus);
    });
});
