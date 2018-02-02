'use strict';

describe("AppointmentsCreateController", function () {
    var $scope, controller, appointmentsServiceService, q, $window, appService, ngDialog, messagingService, $state,
        spinner, appointmentsService, patientService, $translate, appDescriptor, $stateParams, appointmentCreateConfig,
        appointmentContext, $http;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, $q) {
            controller = $controller;
            $scope = $rootScope.$new();
            q = $q;
        });
    });

    beforeEach(function () {
        appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['getServiceLoad', 'getService']);
        appointmentsServiceService.getServiceLoad.and.returnValue(specUtil.simplePromise({}));
        appointmentsService = jasmine.createSpyObj('appointmentsService', ['save','search']);
        appointmentsService.save.and.returnValue(specUtil.simplePromise({}));
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appDescriptor = {
            getConfigValue: function (input) {
                if (input === "patientSearchUrl") {
                    return "patientSearchUrl";
                }
                else
                    return true;
            },
            formatUrl: function (url) {
                return url;
            }
        };
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        ngDialog = jasmine.createSpyObj('ngDialog', ['close']);
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        patientService = jasmine.createSpyObj('patientService', ['search']);
        $translate = jasmine.createSpyObj('$translate', ['']);
        $state = jasmine.createSpyObj('$state', ['go']);
        spinner = jasmine.createSpyObj('spinner', ['forPromise', 'forAjaxPromise']);
        $window = jasmine.createSpyObj('$window', ['open']);
        $http = jasmine.createSpyObj('$http', ['get']);
        $stateParams = {};
        appointmentCreateConfig = {};
        appointmentContext = {};
    });

    var createController = function () {
        spinner.forPromise.and.callFake(function () {
            return {
                then: function () {
                    return {};
                }
            };
        });
        return controller('AppointmentsCreateController', {
            $scope: $scope,
            $q: q,
            $state: $state,
            appointmentsServiceService: appointmentsServiceService,
            messagingService: messagingService,
            ngDialog: ngDialog,
            appService: appService,
            $window: $window,
            spinner: spinner,
            appointmentsService: appointmentsService,
            patientService: patientService,
            $translate: $translate,
            $stateParams: $stateParams,
            appointmentCreateConfig: appointmentCreateConfig,
            appointmentContext: appointmentContext,
            $http: $http
        }
        );
    };

    it('should init appointment with defaultAppointmentKind if there is no appointment in appointmentContext', function () {
        createController();
        expect($scope.appointment.appointmentKind).toBe('Scheduled');
    });

    it('should init appointment with appointment in appointmentContext', function () {
        appointmentContext = {appointment: {comments: 'Some notes'}};
        createController();
        expect($scope.appointment.comments).toBe(appointmentContext.appointment.comments);
    });

    it('should set service details on serviceChange', function () {
        createController();
        $scope.appointment.service = {uuid: 'serviceUuid'};
        var service = {name: 'Knee', description: 'treatment', uuid: 'serviceUuid', location: {}, durationMins: 45, serviceTypes: [{name: 'type1', duration: 15}]};
        appointmentsServiceService.getService.and.returnValue(specUtil.simplePromise({data: service}));
        $scope.onServiceChange();
        expect(appointmentsServiceService.getService).toHaveBeenCalledWith($scope.appointment.service.uuid);
        expect($scope.selectedService).toBe(service);
        expect($scope.minDuration).toEqual(service.durationMins);
    });

    it('should set default duration if service duration does not exist on serviceChange', function () {
        createController();
        $scope.appointment.service = {uuid: 'serviceUuid'};
        var service = {name: 'Knee', description: 'treatment', uuid: 'serviceUuid', location: {}};
        appointmentsServiceService.getService.and.returnValue(specUtil.simplePromise({data: service}));
        $scope.onServiceChange();
        expect(appointmentsServiceService.getService).toHaveBeenCalledWith($scope.appointment.service.uuid);
        expect($scope.minDuration).toEqual(Bahmni.Appointments.Constants.minDurationForAppointment);
    });

    describe('confirmationDialogOnStateChange', function () {
        beforeEach(function () {
            $state.name = 'home.manage.appointments.calendar.new';
            createController();
        });

        it('should set the isFilterOpen from state params', function () {
            $stateParams.isFilterOpen = true;
            createController();
            expect($scope.isFilterOpen).toBeTruthy();
            expect($scope.showConfirmationPopUp).toBeTruthy();
        });

        it('should stay in current state if Cancel is selected', function () {
            expect($state.name).toEqual('home.manage.appointments.calendar.new');
            $scope.cancelTransition();
            expect($state.name).toEqual('home.manage.appointments.calendar.new');
            expect(ngDialog.close).toHaveBeenCalled();
        });

        it('should go to previous view with appointment date after saving the appointment', function () {
            createController();
            $scope.createAppointmentForm = {$invalid: false};
            var appointment = {
                date: moment().toDate(),
                startTime: '09:00 am',
                endTime: '09:30 am',
                patient: {uuid: 'patientUuid'},
                service: {uuid: 'serviceUuid'}
            };
            $scope.appointment = appointment;
            $scope.patientAppointments = [];
            $state.params = {};
            $scope.save();
            expect(appointmentsService.save).toHaveBeenCalled();
            expect($state.go).toHaveBeenCalledWith('^', $state.params, {reload: true});
        });
    });

    describe('availabilityValidations', function () {
        it('should not check for conflicts with itself(same uuid), when editing an appointment', function () {
            createController();
            $scope.createAppointmentForm = {$invalid: false};
            var appointment = {
                date: moment().toDate(),
                startTime: '09:00 am',
                endTime: '09:30 am',
                patient: {uuid: 'patientUuid'},
                service: {uuid: 'serviceUuid'}
            };
            $scope.patientAppointments = [appointment];
            $state.params = {};
            $scope.appointment = appointment;
            $scope.save();

            expect(appointmentsService.save).toHaveBeenCalled();
        });

        it('should not check for conflicts with cancelled appointments', function () {
            createController();
            $scope.createAppointmentForm = {$invalid: false};
            var cancelledAppointment = {
                date: moment().toDate(),
                startTime: '09:00 am',
                endTime: '09:30 am',
                patient: {uuid: 'patientUuid'},
                service: {uuid: 'serviceUuid'},
                status: 'Cancelled',
                uuid: 'uuid'
            },
            newAppointment = {
                date: moment().toDate(),
                startTime: '09:00 am',
                endTime: '09:30 am',
                patient: {uuid: 'patientUuid'},
                service: {uuid: 'serviceUuid'},
                uuid: 'newUuid'
            };
            $scope.patientAppointments = [cancelledAppointment];
            $state.params = {};
            $scope.appointment = newAppointment;
            $scope.save();

            expect(appointmentsService.save).toHaveBeenCalled();
        });

        it('should not conflict when the same patient has another appointment at end time of previous appointment', function () {
            createController();
            $scope.createAppointmentForm = {$invalid: false};
            var previousAppointment = {
                date: moment().toDate(),
                startTime: '09:15:00',
                endTime: '12:20:00',
                patient: {uuid: 'patientUuid'},
                service: {uuid: 'serviceUuid'},
                status: 'Scheduled',
                uuid: 'uuid'
            },
            newAppointment = {
                date: moment().toDate(),
                startTime: '12:20:00',
                endTime: '13:20:00',
                patient: {uuid: 'patientUuid'},
                service: {uuid: 'serviceUuid'},
                uuid: 'newUuid'
            };
            previousAppointment = Bahmni.Appointments.Appointment.create(previousAppointment);
            $scope.patientAppointments = [previousAppointment];
            $state.params = {};
            $scope.appointment = newAppointment;
            $scope.save();

            expect(appointmentsService.save).toHaveBeenCalled();
        });

        it('should initialize patientAppointments, if an appointment is editing', function () {
            var patientAppointmentsData = [{
                uuid: 'veryNewUuid'
            },
            {
                uuid: 'newUuid'
            }];
            var patientAppointments = {
                data: patientAppointmentsData
            };
            appointmentsService.search.and.returnValue(specUtil.simplePromise(patientAppointments));
            $scope.patientAppointments = undefined;
            var patientUuid = 'uuid';
            appointmentContext = {appointment: {patient:{uuid: patientUuid}}};
            var appointmentSearchParams = {patientUuid: patientUuid};
            createController();

            expect(appointmentsService.search).toHaveBeenCalledWith(appointmentSearchParams);
            expect($scope.patientAppointments).toBe(patientAppointmentsData);
        });

        it('should not set the warning message when start time is same as the start time of service availability', function () {
            createController();
            $scope.appointment.date = new Date('Mon Aug 28 2017 14:30:00 GMT+0530 (IST)');
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00'}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.appointment.startTime = '09:00 am';
            $scope.warning.startTime = true;
            $scope.onSelectStartTime();
            expect($scope.warning.startTime).toBeFalsy();
        });

        it('should not set the warning message when start time is before the service end time', function () {
            createController();
            $scope.appointment.date = new Date('Mon Aug 28 2017 14:30:00 GMT+0530 (IST)');
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00'}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.appointment.startTime = '09:41 am';
            $scope.warning.startTime = true;
            $scope.onSelectStartTime();
            expect($scope.warning.startTime).toBeFalsy();
        });

        it('should set the warning message when start time is outside the service available time', function () {
            createController();
            $scope.appointment.date = new Date('Mon Aug 28 2017 14:30:00 GMT+0530 (IST)');
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00'}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.appointment.startTime = '08:00 am';
            $scope.warning.startTime = false;
            $scope.onSelectStartTime();
            expect($scope.warning.startTime).toBeTruthy();

            $scope.appointment.startTime = '12:30 pm';
            $scope.warning.startTime = false;
            $scope.onSelectStartTime();
            expect($scope.warning.startTime).toBeTruthy();
        });

        it('should set the warning message when start time is outside the service available time and multiple service available times are defined for a day', function () {
            createController();
            $scope.appointment.date = new Date('Mon Aug 28 2017 14:30:00 GMT+0530 (IST)');
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00'}, {dayOfWeek: 'MONDAY', startTime: '14:00:00', endTime: '17:00:00'}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.appointment.startTime = '01:00 pm';
            $scope.warning.startTime = false;
            $scope.minDuration = 30;
            $scope.onSelectStartTime();
            expect($scope.warning.startTime).toBeTruthy();
            expect($scope.warning.endTime).toBeTruthy();
        });

        it('should not set the warning message when start time is within the second service available time and multiple service available times are defined for a day', function () {
            createController();
            $scope.appointment.date = new Date('Mon Aug 28 2017 14:30:00 GMT+0530 (IST)');
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00'}, {dayOfWeek: 'MONDAY', startTime: '14:00:00', endTime: '17:00:00'}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.appointment.startTime = '03:00 pm';
            $scope.warning.startTime = false;
            $scope.minDuration = 30;
            $scope.onSelectStartTime();
            expect($scope.warning.startTime).toBeFalsy();
            expect($scope.warning.endTime).toBeFalsy();
        });

        it('should not set warning on start time when the service availability is not defined for a given day', function () {
            createController();
            $scope.appointment.date = new Date('Sun Aug 27 2017 14:30:00 GMT+0530 (IST)');
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00'}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.appointment.startTime = '06:00 am';
            $scope.warning.startTime = true;
            $scope.onSelectStartTime();
            expect($scope.warning.startTime).toBeFalsy();
        });

        it('should reset the warning on start time to false when start time is undefined', function () {
            createController();
            $scope.warning.startTime = true;
            $scope.appointment.startTime = undefined;
            $scope.onSelectStartTime();
            expect($scope.warning.startTime).toBeFalsy();
        });

        it('should not set the warning message when end time is inside the service availability', function () {
            createController();
            $scope.appointment.date = new Date('Mon Aug 28 2017 14:30:00 GMT+0530 (IST)');
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00'}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.appointment.endTime = '09:00 am';
            $scope.warning.endTime = true;
            $scope.onSelectEndTime();
            expect($scope.warning.endTime).toBeFalsy();
        });

        it('should set the warning on end time when it is outside the service availability', function () {
            createController();
            $scope.appointment.date = new Date('Mon Aug 28 2017 11:30:00 GMT+0530 (IST)');
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00'}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.appointment.endTime = '01:30 pm';
            $scope.onSelectEndTime();
            expect($scope.warning.endTime).toBeTruthy();
        });

        it('should reset the warning on day to false if appointment date is undefined', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00'}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.warning.appointmentDate = true;
            $scope.appointment.date = undefined;
            $scope.checkAvailability();
            expect($scope.warning.appointmentDate).toBeFalsy();
        });

        it('should not set warning on a day and set default start and end times when the service weekly availability is not defined for a given day', function () {
            createController();
            $scope.appointment.date = moment().toDate();
            $scope.selectedService = {
                weeklyAvailability: [],
                startTime: undefined,
                endTime: undefined
            };
            $scope.checkAvailability();
            expect($scope.warning.appointmentDate).toBeFalsy();
            expect($scope.allowedStartTime).toEqual('12:00 am');
            expect($scope.allowedEndTime).toEqual('11:59 pm');
        });

        it('should set warning on a day and allowedStartTime and allowedEndTime to undefined when the service availability is not defined for a given day', function () {
            createController();
            $scope.appointment.date = moment('2017-08-04').toDate();
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00'}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.checkAvailability();
            expect($scope.warning.appointmentDate).toBeTruthy();
            expect($scope.allowedStartTime).toBeUndefined();
            expect($scope.allowedEndTime).toBeUndefined();
        });

        it('should remove warning on a day and set allowedStartTime and allowedEndTime when the service availability is defined for a given day', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00'}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.warning.appointmentDate = true;
            $scope.appointment.date = moment('2017-08-07').toDate();
            $scope.checkAvailability();
            expect($scope.warning.appointmentDate).toBeFalsy();
            expect($scope.weeklyAvailabilityOnSelectedDate.length).toEqual(1);
            expect($scope.weeklyAvailabilityOnSelectedDate[0].startTime).toEqual('09:00:00');
            expect($scope.weeklyAvailabilityOnSelectedDate[0].endTime).toEqual('12:00:00');
        });

        it('should calculate warning messages for start time and end time when appointment date is changed', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '12:00:00'}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.warning.appointmentDate = false;
            $scope.warning.startTime = true;
            $scope.warning.endTime = true;
            $scope.appointment.startTime = '08:00 am';
            $scope.appointment.endTime = '08:30 am';
            $scope.appointment.date = moment('2017-08-08').toDate();
            $scope.checkAvailability();
            expect($scope.warning.appointmentDate).toBeTruthy();
            expect($scope.warning.startTime).toBeFalsy();
            expect($scope.warning.endTime).toBeFalsy();
            $scope.appointment.date = moment('2017-08-07').toDate();
            $scope.checkAvailability();
            expect($scope.warning.appointmentDate).toBeFalsy();
            expect($scope.warning.startTime).toBeTruthy();
            expect($scope.warning.endTime).toBeTruthy();
        });

        it('should validate and set allowedStartTime and allowedEndTime ' +
            'when service weeklyAvailability is not defined but service start time and end time are defined', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [],
                startTime: '09:00 am',
                endTime: '11:00 am'
            };
            $scope.appointment.date = moment().toDate();
            $scope.checkAvailability();
            expect($scope.warning.appointmentDate).toBeFalsy();
            expect($scope.allowedStartTime).toEqual('09:00 am');
            expect($scope.allowedEndTime).toEqual('11:00 am');
        });

        it('should reset availability warnings when a service is selected', function () {
            createController();
            $scope.warning.appointmentDate = true;
            $scope.warning.startTime = true;
            $scope.warning.endTime = true;
            $scope.onServiceChange();
            expect($scope.warning.appointmentDate).toBeFalsy();
            expect($scope.warning.startTime).toBeFalsy();
            expect($scope.warning.endTime).toBeFalsy();
        });

        it('should reset availability warnings when a service type is selected', function () {
            createController();
            $scope.warning.appointmentDate = true;
            $scope.warning.startTime = true;
            $scope.warning.endTime = true;
            $scope.appointment.serviceType = {name: 'initial', duration: 23};
            $scope.onServiceTypeChange();
            expect($scope.warning.appointmentDate).toBeFalsy();
            expect($scope.warning.startTime).toBeFalsy();
            expect($scope.warning.endTime).toBeFalsy();
        });

        it('should not include endTime value in startTimeSlots and startTime value should not be included in endTimeSlots', function () {
            createController();
            $scope.isPastAppointment = false;
            $scope.appointment = { date: new Date('1970-01-01T11:30:00.000Z') };
            $scope.selectedService= { startTime: '10:00', endTime: '13:00' };
            $scope.minDuration = 60;
            $scope.checkAvailability();

            expect($scope.startTimes.length).toEqual(3);
            expect($scope.endTimes.length).toEqual(3);
        });

        it('should get all slots for weekly availability', function () {
            createController();
            var availabilityMaxLoad = 8;
            $scope.isPastAppointment = false;
            $scope.minDuration = 30;
            $scope.appointment = { date: new Date('2017-10-05T11:30:00.000Z') };
            $scope.selectedService = {
                startTime: '00:30:00',
                endTime: '18:30:00',
                weeklyAvailability: [
                    {
                        dayOfWeek: 'THURSDAY',
                        startTime: '10:00:00',
                        endTime: '11:00:00',
                        maxAppointmentsLimit: availabilityMaxLoad
                    },
                    {
                        dayOfWeek: 'THURSDAY',
                        startTime: '12:00:00',
                        endTime: '13:00:00',
                        maxAppointmentsLimit: availabilityMaxLoad
                    }
                ]
            };
            $scope.checkAvailability();

            expect($scope.startTimes.length).toEqual(4);
            expect($scope.endTimes.length).toEqual(4);
        });

        it('should get empty slots when there is weekly availability but not for the given appointment day', function () {
            createController();
            var availabilityMaxLoad = 8;
            $scope.isPastAppointment = false;
            $scope.minDuration = 30;
            $scope.appointment = { date: new Date('2017-10-04T11:30:00.000Z') };
            $scope.selectedService = {
                startTime: '00:30:00',
                endTime: '18:30:00',
                weeklyAvailability: [
                    {
                        dayOfWeek: 'THURSDAY',
                        startTime: '10:00:00',
                        endTime: '11:00:00',
                        maxAppointmentsLimit: availabilityMaxLoad
                    },
                    {
                        dayOfWeek: 'THURSDAY',
                        startTime: '12:00:00',
                        endTime: '13:00:00',
                        maxAppointmentsLimit: availabilityMaxLoad
                    }
                ]
            };
            $scope.checkAvailability();

            expect($scope.startTimes.length).toEqual(0);
            expect($scope.endTimes.length).toEqual(0);
        });
    });

    describe('loadCalculation', function () {
        it('should trigger load calculation on date change', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [],
                startTime: '09:00 am',
                endTime: '11:00 am'
            };
            $scope.appointment = {
                service: {name: 'Cardiology'},
                date: moment().toDate(),
                startTime: '09:00 am',
                endTime: '11:00 am'
            };
            $scope.checkAvailability();
            expect(appointmentsServiceService.getServiceLoad).toHaveBeenCalled();
        });

        it('should trigger load calculation on time change', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [],
                startTime: '09:00 am',
                endTime: '11:00 am',
                serviceTypes: []
            };
            $scope.appointment = {
                service: {name: 'Cardiology'},
                date: moment().toDate(),
                startTime: '09:00 am',
                endTime: '11:00 am'
            };
            $scope.onSelectEndTime();
            expect(appointmentsServiceService.getServiceLoad).toHaveBeenCalled();
        });

        it('should not trigger load calculation on time change when service types are defined', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [],
                startTime: '09:00 am',
                endTime: '11:00 am',
                serviceTypes: ['serviceType1']
            };
            $scope.appointment = {
                service: {name: 'Cardiology'},
                date: moment().toDate(),
                startTime: '09:00 am',
                endTime: '11:00 am'
            };
            $scope.onSelectEndTime();
            expect(appointmentsServiceService.getServiceLoad).not.toHaveBeenCalled();
        });

        it('should not trigger load calculation on time change when timings are out of service availability', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [],
                startTime: '09:00 am',
                endTime: '11:00 am',
                maxAppointmentsLimit: 5
            };
            $scope.appointment = {
                service: {name: 'Cardiology'},
                date: moment().toDate(),
                startTime: '11:30 am',
                endTime: '01:00 pm'
            };
            $scope.onSelectEndTime();
            expect(appointmentsServiceService.getServiceLoad).not.toHaveBeenCalled();
            expect($scope.currentLoad).toBeUndefined();
            expect($scope.maxAppointmentsLimit).toBeUndefined();
        });

        it('should clear the existing slot info', function () {
            createController();
            $scope.currentLoad = 20;
            $scope.maxAppointmentsLimit = 30;
            $scope.selectedService = {
                weeklyAvailability: [],
                startTime: '09:00:00',
                endTime: '11:00:00'
            };
            $scope.appointment = {
                service: {name: 'Cardiology'},
                date: moment().toDate(),
                startTime: '09:00 am',
                endTime: '11:00 am'
            };
            $scope.onSelectEndTime();
            expect($scope.currentLoad).toBeUndefined();
            expect($scope.maxAppointmentsLimit).toBeUndefined();
        });

        it('should assign currentLoad and maxAppointmentsLimit', function () {
            var bookedAppointments = 10;
            var serviceMaxLoad = 30;
            appointmentsServiceService.getServiceLoad.and.returnValue(specUtil.simplePromise({data: bookedAppointments}));
            createController();
            $scope.selectedService = {
                name: 'Cardiology',
                weeklyAvailability: [],
                startTime: '09:00:00',
                endTime: '11:00:00',
                maxAppointmentsLimit: serviceMaxLoad
            };
            $scope.appointment = {
                service: {name: 'Cardiology'},
                date: moment().toDate(),
                startTime: '09:00 am',
                endTime: '11:00 am'
            };
            $scope.onSelectEndTime();
            expect($scope.currentLoad).toBe(bookedAppointments);
            expect($scope.maxAppointmentsLimit).toBe(serviceMaxLoad);
        });

        it('should only assign currentLoad of that day if no duration,startTime&endTime,maxAppointmentsLimit present', function () {
            var bookedAppointments = 10;
            appointmentsServiceService.getServiceLoad.and.returnValue(specUtil.simplePromise({data: bookedAppointments}));
            createController();
            $scope.selectedService = {
                name: 'Cardiology'
            };
            $scope.appointment = {
                service: {name: 'Cardiology'},
                date: moment().toDate(),
                startTime: '09:00 am',
                endTime: '11:00 am'
            };
            $scope.onSelectEndTime();
            expect($scope.currentLoad).toBe(bookedAppointments);
            expect($scope.maxAppointmentsLimit).toBeUndefined();
        });

        it('should calculate maxAppointmentsLimit from service duration,start&endTime if service maxAppointmentsLimit is empty', function () {
            createController();
            $scope.selectedService = {
                name: 'Cardiology',
                weeklyAvailability: [],
                startTime: '09:00:00',
                endTime: '11:00:00',
                durationMins: 30
            };
            $scope.appointment = {
                service: {name: 'Cardiology'},
                date: moment().toDate(),
                startTime: '09:00 am',
                endTime: '11:00 am'
            };
            $scope.onSelectEndTime();
            expect($scope.maxAppointmentsLimit).toBe(4);
        });

        it('should assign currentLoad and maxAppointmentsLimit of availability', function () {
            var bookedAppointments = 10;
            var serviceMaxLoad = 20;
            var availabilityMaxLoad = 8;
            appointmentsServiceService.getServiceLoad.and.returnValue(specUtil.simplePromise({data: bookedAppointments}));
            createController();
            $scope.selectedService = {
                startTime: '00:30:00',
                endTime: '18:30:00',
                maxAppointmentsLimit: serviceMaxLoad,
                weeklyAvailability: [
                    {
                        dayOfWeek: 'THURSDAY',
                        startTime: '10:03:00',
                        endTime: '16:05:00',
                        maxAppointmentsLimit: availabilityMaxLoad
                    }
                ]
            };
            $scope.appointment = {
                service: {name: 'Cardiology'},
                date: new Date('1970-01-01T11:30:00.000Z'),
                startTime: '10:15:00',
                endTime: '12:20:00'
            };
            $scope.onSelectEndTime();
            expect($scope.currentLoad).toBe(bookedAppointments);
            expect($scope.maxAppointmentsLimit).toBe(availabilityMaxLoad);
        });

        it('should calculate maxAppointmentsLimit from service duration and availability start&endTime if availability maxAppointmentsLimit is empty', function () {
            var serviceMaxLoad = 20;
            createController();
            $scope.selectedService = {
                startTime: '00:30:00',
                endTime: '18:30:00',
                maxAppointmentsLimit: serviceMaxLoad,
                weeklyAvailability: [
                    {
                        dayOfWeek: 'THURSDAY',
                        startTime: '10:03:00',
                        endTime: '16:05:00'
                    }
                ],
                durationMins: 10
            };
            $scope.appointment = {
                service: {name: 'Cardiology'},
                date: new Date('1970-01-01T11:30:00.000Z'),
                startTime: '10:15:00',
                endTime: '12:20:00'
            };
            $scope.onSelectEndTime();
            expect($scope.maxAppointmentsLimit).toBe(36);
        });

        it('should not calculate slot info if appointment is booked outside the availability', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [
                    {
                        dayOfWeek: 'SUNDAY',
                        startTime: '10:03:00',
                        endTime: '16:05:00',
                        maxAppointmentsLimit: 5
                    }
                ]
            };
            $scope.appointment = {
                service: {name: 'Cardiology'},
                date: new Date('1970-01-01T11:30:00.000Z'),
                startTime: '09:15:00',
                endTime: '12:20:00'
            };
            $scope.onSelectEndTime();
            expect($scope.currentLoad).toBeUndefined();
            expect($scope.maxAppointmentsLimit).toBeUndefined();
        });

        it('outOfRange should be true when selected date having more than one availability slots, and startTime and endTime are not in one slot', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [
                    {
                        dayOfWeek: 'SUNDAY',
                        startTime: '10:00:00',
                        endTime: '13:00:00',
                        maxAppointmentsLimit: 5
                    },
                    {
                        dayOfWeek: 'SUNDAY',
                        startTime: '17:00:00',
                        endTime: '18:00:00',
                        maxAppointmentsLimit: 5
                    }
                ]
            };
            $scope.appointment = {
                service: {name: 'Cardiology'},
                date: new Date('2017-10-08T11:30:00.000Z'),
                startTime: '11:15:00',
                endTime: '17:20:00'
            };
            $scope.warning = {
                appointmentDate: false,
                startTime: false,
                endTime: false,
                outOfRange: false
            };
            $scope.onSelectEndTime();
            expect($scope.warning.outOfRange).toBeTruthy();
        });

        it('outOfRange should be false when there is no weekly service and appointmentDate, startTime, endTime are false', function () {
            createController();
            $scope.warning = {
                appointmentDate: false,
                startTime: false,
                endTime: false,
                outOfRange: false
            };
            $scope.onSelectEndTime();
            expect($scope.warning.outOfRange).toBeFalsy();
        });
    });

    it('should navigate to previous state', function () {
        createController();
        $scope.navigateToPreviousState();
        expect($state.go).toHaveBeenCalledWith('^', $state.params, {reload: true});
    });

    describe('isEditAllowed', function () {

        it('should not allow edit if it is past appointment irrespective of status', function () {
            appointmentContext.appointment = {startDateTime: moment().subtract(1, 'day').toDate(), status: 'Scheduled', uuid: 'appointmentUuid'};
            createController();
            expect($scope.isEditAllowed()).toBeFalsy();
        });

        it('should allow edit for scheduled appointment if is of current date', function () {
            appointmentContext.appointment = {startDateTime: moment().toDate(), status: 'Scheduled', uuid: 'appointmentUuid'};
            createController();
            expect($scope.isEditAllowed()).toBeTruthy();
        });

        it('should allow edit for checked-in appointment if is of current date', function () {
            appointmentContext.appointment = {startDateTime: moment().toDate(), status: 'CheckedIn', uuid: 'appointmentUuid'};
            createController();
            expect($scope.isEditAllowed()).toBeTruthy();
        });

        it('should not allow edit for completed appointment if is of current date', function () {
            appointmentContext.appointment = {startDateTime: moment().toDate(), status: 'Completed', uuid: 'appointmentUuid'};
            createController();
            expect($scope.isEditAllowed()).toBeFalsy();
        });

        it('should not allow edit for cancelled appointment if is of current date', function () {
            appointmentContext.appointment = {startDateTime: moment().toDate(), status: 'Cancelled', uuid: 'appointmentUuid'};
            createController();
            expect($scope.isEditAllowed()).toBeFalsy();
        });

        it('should allow edit for scheduled appointment if is of future date', function () {
            appointmentContext.appointment = {startDateTime: moment().add(1, 'day').toDate(), status: 'Scheduled', uuid: 'appointmentUuid'};
            createController();
            expect($scope.isEditAllowed()).toBeTruthy();
        });

        it('should allow edit for checked-in appointment if is of future date', function () {
            appointmentContext.appointment = {startDateTime: moment().add(1, 'day').toDate(), status: 'CheckedIn', uuid: 'appointmentUuid'};
            createController();
            expect($scope.isEditAllowed()).toBeTruthy();
        });

        it('should not allow edit for completed appointment if is of future date', function () {
            appointmentContext.appointment = {startDateTime: moment().add(1, 'day').toDate(), status: 'Completed', uuid: 'appointmentUuid'};
            createController();
            expect($scope.isEditAllowed()).toBeFalsy();
        });

        it('should not allow edit for cancelled appointment if is of future date', function () {
            appointmentContext.appointment = {startDateTime: moment().add(1, 'day').toDate(), status: 'Cancelled', uuid: 'appointmentUuid'};
            createController();
            expect($scope.isEditAllowed()).toBeFalsy();
        });
    });


    describe('searchPatient', function () {
        it('should call patient service when there is no url defined ', function () {
            appDescriptor.getConfigValue = function (input) {
                return input !== "patientSearchUrl" ? true : undefined;
            };
            appointmentContext.appointment = { uuid: 'appointmentUuid'};
            createController();
            $scope.appointment.patient = { label: "GAN" };
            patientService.search.and.returnValue(specUtil.simplePromise({data: {name:"GAN111"}}));
            $scope.search();
            expect(patientService.search).toHaveBeenCalledWith("GAN");
        });

        it('should call the url specified in the config for patient search', function () {
            appointmentContext.appointment = { uuid: 'appointmentUuid'};
            createController();
            $scope.appointment.patient = { label: "GAN" };
            patientService.search.and.returnValue(specUtil.simplePromise({data: {name:"GAN111"}}));
            $scope.search();
            expect($http.get).toHaveBeenCalledWith('/openmrs/ws/rest/v1patientSearchUrl');
            expect(patientService.search).not.toHaveBeenCalledWith();
        });
    });

    it('should retain previous minDuration when service type is unselected', function () {
        createController();
        $scope.minDuration = 15;
        var serviceDuration = 20;
        $scope.appointment = {service: {name: 'Cardiology', durationMins: serviceDuration}};
        $scope.onServiceTypeChange();
        expect($scope.minDuration).toEqual(15);
    });

    it("should dropDown have times list which are having entered number in hours of the allowed list", function () {
       createController();
        $scope.startTimes = ['10:00 am', '11:00 am', '12:00 pm', '01:00 pm', '02:00 pm'];
        $scope.showStartTimes = [];
        $scope.appointment= { startTime: 2 };

        $scope.onKeyDownOnStartTime();
        expect($scope.showStartTimes).toEqual(['02:00 pm']);
    });

    it('should dropDown have all the allowed time list when the entered number is not in hours of the allowed list', function () {
        createController();
        $scope.endTimes = ['10:00 am', '11:00 am', '12:00 pm', '01:00 pm', '02:00 pm', '03:00 pm'];
        $scope.showEndTimes = [];
        $scope.appointment= { endTime: 4 };

        $scope.onKeyDownOnEndTime();
        expect($scope.showEndTimes).toEqual($scope.endTimes);
    })
});
