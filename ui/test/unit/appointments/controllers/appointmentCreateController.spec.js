'use strict';

ddescribe('Controller: AppointmentsCreateController', function () {
    var $scope, controller, specialityService, appointmentsServiceService, locationService,
        q, $window, appService, ngDialog, providerService, messagingService, $state, spinner, appointmentsService,
        patientService, $translate, appDescriptor, specialities, appointmentServices, locations;

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

        ngDialog = jasmine.createSpyObj('ngDialong', ['close']);
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        providerService = jasmine.createSpyObj('providerService', ['search']);
        $translate = jasmine.createSpyObj('$translate', ['']);
        spinner = jasmine.createSpyObj('spinner', ['forPromise', 'forAjaxPromise']);
        $window = jasmine.createSpyObj('$window', ['open']);
    });

    var createController = function () {
        return controller('AppointmentServiceController', {
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

    it('should fetch all appointment locations on initialization', function () {
        expect($scope.locations).toBeUndefined();
        createController();
        expect(locationService.getAllByTag).toHaveBeenCalledWith('Appointment Location');
    });

    it('should ', function () {
        $scope.save();
        expect(2==2);
    });

});