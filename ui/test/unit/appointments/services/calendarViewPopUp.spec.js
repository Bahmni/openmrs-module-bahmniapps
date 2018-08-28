'use strict';

describe('CalendarViewPopUp', function () {
    var rootScope, calendarViewPopUp, popUpScope, ngDialog, $state, confirmBox, $translate, appointmentsService, dialog,
        appService, appDescriptor, messagingService;

    beforeEach(function () {
        module('bahmni.appointments');
        module(function ($provide) {
            popUpScope = {};
            popUpScope.$destroy = jasmine.createSpy('$destroy');
            ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
            dialog = {};
            dialog.id = 'dialogId';
            dialog.closePromise = specUtil.simplePromise({});
            ngDialog.open.and.returnValue(dialog);
            $state = jasmine.createSpyObj('$state', ['go']);
            confirmBox = jasmine.createSpy('confirmBox');
            $translate = jasmine.createSpyObj('$translate', ['instant', 'storageKey', 'storage', 'preferredLanguage']);
            appointmentsService = jasmine.createSpyObj('appointmentsService', ['changeStatus']);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);

            $provide.value('ngDialog', ngDialog);
            $provide.value('$state', $state);
            $provide.value('confirmBox', confirmBox);
            $provide.value('$translate', $translate);
            $provide.value('appointmentsService', appointmentsService);
            $provide.value('appService', appService);
            $provide.value('messagingService', messagingService);
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
            className: 'ngdialog-theme-default'
        });
    });

    it('closePromise should reload current state if value false', function () {
        dialog.closePromise = specUtil.simplePromise({value: false});
        ngDialog.close.and.callFake(function () {
            dialog.closePromise();
            expect($state.go).toHaveBeenCalledWith($state.current, $state.params, {reload: true});
        });
        var config = {scope: {appointments: []}};
        calendarViewPopUp(config);
    });

    it('closePromise should reload current state if value is not false', function () {
        dialog.closePromise = specUtil.simplePromise({value: true});
        ngDialog.close.and.callFake(function () {
            dialog.closePromise();
            expect($state.go).not.toHaveBeenCalled();
        });
        var config = {scope: {appointments: []}};
        calendarViewPopUp(config);
    });

    it('should go to new appointment state on navigateTo new', function () {
        $state.params = {};
        var appointments = [{
            startDateTime: moment(),
            endDateTime: moment().add(30, 'minutes'),
            provider: {name: 'Superman'},
            patient: {uuid: 'patientUuid'}
        }];
        var config = {scope: {appointments: appointments}};
        calendarViewPopUp(config);
        popUpScope.navigateTo('new');
        expect(ngDialog.close).toHaveBeenCalledWith(dialog.id, false);
        expect($state.params.appointment).toEqual({
            startDateTime: appointments[0].startDateTime,
            endDateTime: appointments[0].endDateTime,
            provider: appointments[0].provider,
            appointmentKind: 'Scheduled'
        });
        expect($state.go).toHaveBeenCalledWith('home.manage.appointments.calendar.new', $state.params, {reload: false});
    });

    it('should go to edit appointment state on navigateTo edit', function () {
        $state.params = {};
        var appointment = {uuid: 'appointUuid', patient: {uuid: 'patientUuid'}};
        var config = {scope: {appointments: [appointment]}};
        calendarViewPopUp(config);
        popUpScope.patient = {uuid: 'patientUuid'};
        popUpScope.navigateTo('edit', appointment);
        expect(ngDialog.close).toHaveBeenCalledWith(dialog.id, false);
        expect($state.params.uuid).toBe(appointment.uuid);
        expect($state.go).toHaveBeenCalledWith('home.manage.appointments.calendar.edit', $state.params, {reload: false});
    });

    it('should reload current state on navigateTo any other', function () {
        $state.params = {};
        $state.current = 'home.manage.appointments.calendar';
        var config = {scope: {appointments: []}};
        calendarViewPopUp(config);
        popUpScope.navigateTo();
        expect($state.go).toHaveBeenCalledWith($state.current, $state.params, {reload: true});
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
        var message = "Successfully changed appointment status to Cancelled";
        appointmentsService.changeStatus.and.returnValue(specUtil.simplePromise({}));
        $translate.instant.and.returnValue(message);
        confirmBox.and.callFake(function (config) {
            var close = jasmine.createSpy('close');
            config.scope.yes(close).then(function () {
                expect(appointmentsService.changeStatus).toHaveBeenCalledWith(appointment.uuid, toStatus, undefined);
                expect(appointment.status).toBe(toStatus);
                expect(close).toHaveBeenCalled();
                expect(messagingService.showMessage).toHaveBeenCalledWith('info', message);
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

    describe('isAllowedAction', function () {
        it('should init with empty array if config is undefined', function () {
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value === 'allowedActions') {
                    return undefined;
                }
                return value;
            });
            var config = {scope: {appointments: []}};
            calendarViewPopUp(config);
            expect(popUpScope.allowedActions).toEqual([]);
        });

        it('should init with configured actions if config is present', function () {
            var allowedActionsConfig = ['Missed', 'CheckedIn'];
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value === 'allowedActions') {
                    return allowedActionsConfig;
                }
                return value;
            });
            var config = {scope: {appointments: []}};
            calendarViewPopUp(config);
            expect(popUpScope.allowedActions).toEqual(allowedActionsConfig);
        });

        it('should return false if config is empty', function () {
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value === 'allowedActions') {
                    return undefined;
                }
                return value;
            });
            var config = {scope: {appointments: []}};
            calendarViewPopUp(config);
            expect(popUpScope.isAllowedAction('Missed')).toBeFalsy();
            expect(popUpScope.isAllowedAction('Completed')).toBeFalsy();
            expect(popUpScope.isAllowedAction('Random')).toBeFalsy();
        });

        it('should return true if action exists in config', function () {
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value === 'allowedActions') {
                    return ['Completed', 'CheckedIn'];
                }
                return value;
            });
            var config = {scope: {appointments: []}};
            calendarViewPopUp(config);
            expect(popUpScope.isAllowedAction('Completed')).toBeTruthy();
            expect(popUpScope.isAllowedAction('CheckedIn')).toBeTruthy();
        });

        it('should return false if action does not exist in config', function () {
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value === 'allowedActions') {
                    return ['Completed', 'CheckedIn'];
                }
                return value;
            });
            var config = {scope: {appointments: []}};
            calendarViewPopUp(config);
            expect(popUpScope.isAllowedAction('Missed')).toBeFalsy();
            expect(popUpScope.isAllowedAction('Random')).toBeFalsy();
        });
    });

    describe('isValidAction', function () {
        it('should init with empty object if config is undefined', function () {
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value === 'allowedActionsByStatus') {
                    return undefined;
                }
                return value;
            });
            var config = {scope: {appointments: []}};
            calendarViewPopUp(config);
            expect(popUpScope.allowedActionsByStatus).toEqual({});
        });

        it('should init with configured actions if config is present', function () {
            var allowedActionsByStatus = { "Scheduled": ["Completed", "Missed", "Cancelled"] };
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value === 'allowedActionsByStatus') {
                    return allowedActionsByStatus;
                }
                return value;
            });
            var config = {scope: {appointments: []}};
            calendarViewPopUp(config);
            expect(popUpScope.allowedActionsByStatus).toEqual(allowedActionsByStatus);
        });

        it('should return false if no appointment is selected', function () {
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value === 'allowedActionsByStatus') {
                    return { CheckedIn: ['Completed'] };
                }
                return value;
            });
            var config = {scope: {appointments: []}};
            calendarViewPopUp(config);
            expect(popUpScope.isValidAction(undefined, 'Missed')).toBeFalsy();
        });

        it('should return false if allowedActionsByStatus is undefined', function () {
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value === 'allowedActionsByStatus') {
                    return undefined;
                }
                return value;
            });
            var config = {scope: {appointments: []}};
            rootScope.currentUser = {privileges: [{
                name: Bahmni.Appointments.Constants.privilegeManageAppointments
            }]};
            calendarViewPopUp(config);
            expect(popUpScope.allowedActionsByStatus).toEqual({});
            var appointment = {uuid: 'appointmentUuid', status: 'CheckedIn'};

            expect(popUpScope.isValidAction(appointment, 'Completed')).toBeFalsy();
        });

        it('should return true if action exists in allowedActionsByStatus', function () {
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value === 'allowedActionsByStatus') {
                    return { CheckedIn: ['Completed'] };
                }
                return value;
            });
            var config = {scope: {appointments: []}};
            rootScope.currentUser = {privileges: [{
                    name: Bahmni.Appointments.Constants.privilegeManageAppointments
                }]};
            calendarViewPopUp(config);
            var appointment = {uuid: 'appointmentUuid', status: 'CheckedIn'};

            expect(popUpScope.isValidAction(appointment, 'Completed')).toBeTruthy();
        });

        it('should return false if action does not exist in allowedActionsByStatus', function () {
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value === 'allowedActionsByStatus') {
                    return { Scheduled: ['CheckedIn'] };
                }
                return value;
            });
            var config = {scope: {appointments: []}};
            rootScope.currentUser = {privileges: [{
                    name: Bahmni.Appointments.Constants.privilegeManageAppointments
                }]};
            calendarViewPopUp(config);
            var appointment = {uuid: 'appointmentUuid', status: 'Scheduled'};

            expect(popUpScope.isValidAction(appointment, 'Completed')).toBeFalsy();
        });

        it('should return false if user does not have the required privileges', function () {
            var config = {scope: {appointments: []}};
            rootScope.currentUser = {privileges: []};
            calendarViewPopUp(config);
            var appointment = {};

            expect(popUpScope.isValidAction(appointment, 'Completed')).toBeFalsy();
        });

    });

    describe('isUserAllowedToPerform', function () {
        it('should return true if currentUser has manageAppointments privilege', function () {
            var config = {scope: {appointments: []}};
            rootScope.currentUser = {privileges: [{
                    name: Bahmni.Appointments.Constants.privilegeManageAppointments
                }]};
            calendarViewPopUp(config);

            expect(popUpScope.isUserAllowedToPerform()).toBeTruthy();
        });

        it('should return false if currentUser does not have manage/selfAppointment privileges', function () {
            var config = {scope: {appointments: []}};
            rootScope.currentUser = {privileges: []};
            calendarViewPopUp(config);

            expect(popUpScope.isUserAllowedToPerform()).toBeFalsy();
        });

        it('should return true if currentUser has selfAppointment privilege and selected appointment\'s provider is null', function () {
            var config = {scope: {appointments: [
                        {
                            patient: {uuid: 'patientUuid'},
                            provider: null
                        }
                    ]}};
            rootScope.currentUser = {privileges: [
                    {name: Bahmni.Appointments.Constants.privilegeSelfAppointments}
                ]};
            calendarViewPopUp(config);

            expect(popUpScope.isUserAllowedToPerform()).toBeTruthy();
        });

        it('should return true if currentUser has selfAppointment privilege and is the provider of the selected appointment', function () {
            var config = {scope: {appointments: [
                        {
                            patient: {uuid: 'patientUuid'},
                            provider: {uuid: 'providerUuid'}
                        }
                    ]}};
            rootScope.currentUser = {privileges: [
                    {name: Bahmni.Appointments.Constants.privilegeSelfAppointments}
                ]};
            rootScope.currentProvider = {uuid: 'providerUuid'};
            calendarViewPopUp(config);

            expect(popUpScope.isUserAllowedToPerform()).toBeTruthy();
        });
    });



});
