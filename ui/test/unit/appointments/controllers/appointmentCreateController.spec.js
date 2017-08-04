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
        providerService = jasmine.createSpyObj('providerService', ['list']);
        providerService.list.and.returnValue(specUtil.simplePromise({data: {results: providers}}))
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
});
