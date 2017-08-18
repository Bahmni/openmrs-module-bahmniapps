'use strict';

describe("AppointmentsCreateController", function () {
    var $scope, controller, specialityService, appointmentsServiceService, locationService,
        q, $window, appService, ngDialog, providerService, messagingService, $state, spinner, appointmentsService,
        patientService, $translate, appDescriptor, specialities, appointmentServices, locations, providers;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, $q) {
            controller = $controller;
            $scope = $rootScope.$new();
            q = $q;
        });
    });

    beforeEach(function () {
        specialities = [{name: 'Ortho', uuid: '11da9590-cf11-5594-22zz-989e27121b22'}];
        specialityService = jasmine.createSpyObj('specialityService', ['getAllSpecialities']);
        specialityService.getAllSpecialities.and.returnValue(specUtil.simplePromise({data: specialities}));

        appointmentServices = [{name: "Knee", description: "treatment"}];
        appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['save', 'getAllServices']);
        appointmentsServiceService.save.and.returnValue(specUtil.simplePromise({}));
        appointmentsServiceService.getAllServices.and.returnValue(specUtil.simplePromise({data: appointmentServices}));

        locations = [{display: "OPD", uuid: 1}, {display: "Registration Desk", uuid: 2}];
        locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
        locationService.getAllByTag.and.returnValue(specUtil.simplePromise({data: {results: locations}}));

        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        appDescriptor.getConfigValue.and.returnValue(true);

        ngDialog = jasmine.createSpyObj('ngDialog', ['close']);
        providers = [];
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        providerService = jasmine.createSpyObj('providerService', ['search', 'list']);
        providerService.list.and.returnValue(specUtil.simplePromise({data: {results: providers}}));
        $translate = jasmine.createSpyObj('$translate', ['']);
        $state = jasmine.createSpyObj('$state', ['']);
        spinner = jasmine.createSpyObj('spinner', ['forPromise', 'forAjaxPromise']);
        $window = jasmine.createSpyObj('$window', ['open']);
    });

    var createController = function () {
        return controller('AppointmentsCreateController', {
                $scope: $scope,
                $q: q,
                $state: $state,
                appointmentsServiceService: appointmentsServiceService,
                locationService: locationService,
                messagingService: messagingService,
                specialityService: specialityService,
                ngDialog: ngDialog,
                appService: appService,
                $window: $window,
                providerService: providerService,
                spinner: spinner,
                appointmentsService: appointmentsService,
                patientService: patientService,
                $translate: $translate
            }
        );
    };

    describe('initialization', function () {
        it('should fetch all appointment locations on initialization', function () {
            expect($scope.locations).toBeUndefined();
            createController();
            expect(locationService.getAllByTag).toHaveBeenCalledWith('Appointment Location');
            expect($scope.locations).toBe(locations);
            expect($scope.enableSpecialities).toBeTruthy();
            expect($scope.enableServiceTypes).toBeTruthy();
        });

        it('should not fetch specialities if not configured', function () {
            appDescriptor.getConfigValue.and.returnValue(false);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            expect($scope.specialities).toBeUndefined();
            createController();
            expect(specialityService.getAllSpecialities).not.toHaveBeenCalled();
            expect($scope.specialities).toBeUndefined();
        });

        it('should fetch all specialities on initialization if configured', function () {
            expect($scope.specialities).toBeUndefined();
            createController();
            expect(specialityService.getAllSpecialities).toHaveBeenCalled();
            expect($scope.specialities).toBe(specialities);
        });

        it('should fetch all services on initialization', function () {
            expect($scope.services).toBeUndefined();
            createController();
            expect(appointmentsServiceService.getAllServices).toHaveBeenCalled();
            expect($scope.services).toBe(appointmentServices);
        });
    });

    describe('confirmationDialogOnStateChange', function () {
        beforeEach(function () {
            $state.name = 'home.manage.appointments.calendar.new';
            createController();
        });

        it('should stay in current state if Cancel is selected', function () {
            expect($state.name).toEqual('home.manage.appointments.calendar.new');
            $scope.cancelTransition();
            expect($state.name).toEqual('home.manage.appointments.calendar.new');
            expect(ngDialog.close).toHaveBeenCalled();
        });
    });

    describe('availabilityValidations', function () {
        it('should not set the warning message when start time is same as the start time of service availability', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: "MONDAY", startTime: "09:00:00", endTime: "12:00:00"}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.allowedStartTime = "09:00 am";
            $scope.allowedEndTime = "10:00 am";
            var data = {value: "09:00 am"};
            $scope.warning.startTime = true;
            $scope.onSelectStartTime(data);
            expect($scope.warning.startTime).toBeFalsy();
        });

        it('should not set the warning message when start time is before the service end time', function () {
            createController();
            $scope.allowedStartTime = "09:00 am";
            $scope.allowedEndTime = "10:00 am";
            var data = {value: "09:41 am"};
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: "MONDAY", startTime: "09:00:00", endTime: "12:00:00"}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.onSelectStartTime(data);
            expect($scope.warning.startTime).toBeFalsy();
        });

        it('should set the warning message when start time is outside the service available time', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: "MONDAY", startTime: "09:00:00", endTime: "12:00:00"}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.allowedStartTime = "09:00 am";
            $scope.allowedEndTime = "10:00 am";
            var data = {value: "08:00 am"};
            $scope.onSelectStartTime(data);
            expect($scope.warning.startTime).toBeTruthy();
            data.value = "11:00 am";
            $scope.onSelectStartTime(data);
            expect($scope.warning.startTime).toBeTruthy();
        });

        it('should not set warning on start time when the service availability is not defined for a given day', function () {
            createController();
            var data = undefined;
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: "MONDAY", startTime: "09:00:00", endTime: "12:00:00"}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.allowedStartTime = undefined;
            $scope.allowedEndTime = undefined;
            $scope.appointment.startTime = "06:00 am";
            $scope.onSelectStartTime(data);
            expect($scope.warning.startTime).toBeFalsy();
        });

        it('should reset the warning on start time to false when start time is undefined', function () {
            createController();
            $scope.warning.startTime = true;
            $scope.allowedStartTime = "09:00 am";
            $scope.allowedEndTime = "10:00 am";
            var data = {value: "09:00 am"};
            $scope.onSelectStartTime();
            expect($scope.warning.startTime).toBeFalsy();
        });

        it('should not set the warning message when end time is inside the service availability', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: "MONDAY", startTime: "09:00:00", endTime: "12:00:00"}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.allowedStartTime = "09:00 am";
            $scope.allowedEndTime = "10:00 am";
            var data = {value: "09:00 am"};
            $scope.warning.endTime = true;
            $scope.onSelectEndTime(data);
            expect($scope.warning.endTime).toBeFalsy();
        });

        it('should set the warning on end time when it is outside the service availability', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: "MONDAY", startTime: "09:00:00", endTime: "12:00:00"}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.allowedStartTime = "09:00 am";
            $scope.allowedEndTime = "09:45 am";
            $scope.appointment.endTime = "10:00 am";
            $scope.onSelectEndTime();
            expect($scope.warning.endTime).toBeTruthy();
        });

        it('should reset the warning on day to false if appointment date is undefined', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: "MONDAY", startTime: "09:00:00", endTime: "12:00:00"}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.warning.appointmentDate = true;
            $scope.appointment.date = undefined;
            $scope.OnDateChange();
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
            $scope.OnDateChange();
            expect($scope.warning.appointmentDate).toBeFalsy();
            expect($scope.allowedStartTime).toEqual('08:00 am');
        });

        it('should set warning on a day and allowedStartTime and allowedEndTime to undefined when the service availability is not defined for a given day', function () {
            createController();
            $scope.appointment.date = moment('2017-08-04').toDate();
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: "MONDAY", startTime: "09:00:00", endTime: "12:00:00"}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.OnDateChange();
            expect($scope.warning.appointmentDate).toBeTruthy();
            expect($scope.allowedStartTime).toBeUndefined();
            expect($scope.allowedEndTime).toBeUndefined();
        });

        it('should remove warning on a day and set allowedStartTime and allowedEndTime when the service availability is defined for a given day', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: "MONDAY", startTime: "09:00:00", endTime: "12:00:00"}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.warning.appointmentDate = true;
            $scope.appointment.date = moment('2017-08-07').toDate();
            $scope.OnDateChange();
            expect($scope.warning.appointmentDate).toBeFalsy();
            expect($scope.allowedStartTime).toEqual('09:00:00');
            expect($scope.allowedEndTime).toEqual('12:00:00');
        });

        it('should calculate warning messages for start time and end time when appointment date is changed', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [{dayOfWeek: "MONDAY", startTime: "09:00:00", endTime: "12:00:00"}],
                startTime: undefined,
                endTime: undefined
            };
            $scope.warning.appointmentDate = false;
            $scope.warning.startTime = true;
            $scope.warning.endTime = true;
            $scope.appointment.startTime = "08:00 am";
            $scope.appointment.endTime = "08:30 am";
            $scope.appointment.date = moment('2017-08-08').toDate();
            $scope.OnDateChange();
            expect($scope.warning.appointmentDate).toBeTruthy();
            expect($scope.warning.startTime).toBeFalsy();
            expect($scope.warning.endTime).toBeFalsy();
            $scope.appointment.date = moment('2017-08-07').toDate();
            $scope.OnDateChange();
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
            $scope.OnDateChange();
            expect($scope.warning.appointmentDate).toBeFalsy();
            expect($scope.allowedStartTime).toEqual('09:00 am');
            expect($scope.allowedEndTime).toEqual('11:00 am');
        });

        it('should reset availibility warnings when a service is selected', function () {
            createController();
            $scope.warning.appointmentDate = true;
            $scope.warning.startTime = true;
            $scope.warning.endTime = true;
            $scope.onServiceChange();
            expect($scope.warning.appointmentDate).toBeFalsy();
            expect($scope.warning.startTime).toBeFalsy();
            expect($scope.warning.endTime).toBeFalsy();
        });

        it('should reset availibilty warnings when a service type is selected', function () {
            createController();
            $scope.warning.appointmentDate = true;
            $scope.warning.startTime = true;
            $scope.warning.endTime = true;
            $scope.onServiceTypeChange();
            expect($scope.warning.appointmentDate).toBeFalsy();
            expect($scope.warning.startTime).toBeFalsy();
            expect($scope.warning.endTime).toBeFalsy();
        });


        it('should trigger load calculation on  date change', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [],
                startTime: '09:00 am',
                endTime: '11:00 am'
            };
            spyOn($scope, '$broadcast');
            $scope.appointment.date = moment().toDate();
            $scope.appointment.startTime = '09:00 am';
            $scope.appointment.endTime = '11:00 am';
            $scope.OnDateChange();
            expect($scope.$broadcast).toHaveBeenCalledWith('event:triggerLoadCalculation');

        });

        it('should trigger load calculation on time change', function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [],
                startTime: '09:00 am',
                endTime: '11:00 am',
                serviceTypes: []
            };
            spyOn($scope, '$broadcast');
            $scope.appointment.date = moment().toDate();
            $scope.appointment.startTime = '09:00 am';
            $scope.appointment.endTime = '11:00 am';
            $scope.onSelectEndTime({ value: '11:00 am'});
            expect($scope.$broadcast).toHaveBeenCalledWith('event:triggerLoadCalculation');

        });

        it('should not trigger load calculation on time change when service types are defined' , function () {
            createController();
            $scope.selectedService = {
                weeklyAvailability: [],
                startTime: '09:00 am',
                endTime: '11:00 am',
                serviceTypes: ["serviceType1"]
            };
            spyOn($scope, '$broadcast');
            $scope.appointment.date = moment().toDate();
            $scope.appointment.startTime = '09:00 am';
            $scope.appointment.endTime = '11:00 am';
            $scope.onSelectEndTime({ value: '11:00 am'});
            expect($scope.$broadcast).not.toHaveBeenCalledWith('event:triggerLoadCalculation');

        });
    });
});
