'use strict';

describe('AppointmentConfigInitialization', function () {
    var appointmentConfig, locationService, specialityService, appointmentsServiceService, providerService,
        appService, spinner, $q, locations, specialities, appointmentServices, providers, appDescriptor ;

    beforeEach(function () {
        locations = [{display: 'OPD', uuid: 1}, {display: 'Registration Desk', uuid: 2}];
        locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
        locationService.getAllByTag.and.returnValue(specUtil.simplePromise({data: {results: locations}}));

        specialities = [{name: 'Ortho', uuid: '11da9590-cf11-5594-22zz-989e27121b22'}];
        specialityService = jasmine.createSpyObj('specialityService', ['getAllSpecialities']);
        specialityService.getAllSpecialities.and.returnValue(specUtil.simplePromise({data: specialities}));

        appointmentServices = [{name: 'Knee', description: 'treatment'}];
        appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['getAllServices']);
        appointmentsServiceService.getAllServices.and.returnValue(specUtil.simplePromise({data: appointmentServices}));

        providerService = jasmine.createSpyObj('providerService', ['list']);
        providers = [{display: 'Superman'}];
        providerService.list.and.returnValue(specUtil.simplePromise({data: {results: providers}}));

        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        appDescriptor.getConfigValue.and.returnValue(true);

        spinner = jasmine.createSpyObj('spinner', ['forPromise', 'forAjaxPromise']);
        spinner.forPromise.and.callFake(function (param) {
            return param;
        });
    });

    beforeEach(module('bahmni.appointments', function ($provide) {
        $provide.value('locationService', locationService);
        $provide.value('specialityService', specialityService);
        $provide.value('appointmentsServiceService', appointmentsServiceService);
        $provide.value('providerService', providerService);
        $provide.value('appService', appService);
        $provide.value('spinner', spinner);
        $provide.value('$q', Q);
    }));

    beforeEach(function () {
        inject(['appointmentConfigInitialization', function (_appointmentConfigInitialization_) {
            appointmentConfig = _appointmentConfigInitialization_;
        }]);
    });

    it('should fetch all locations,services,provider,specialities on initialization', function (done) {
        appointmentConfig().then(function (response) {
            expect(locationService.getAllByTag).toHaveBeenCalledWith('Appointment Location');
            expect(appointmentsServiceService.getAllServices).toHaveBeenCalled();
            expect(specialityService.getAllSpecialities).toHaveBeenCalled();
            var config = response;
            expect(config.locations).toBe(locations);
            expect(config.specialities).toBe(specialities);
            expect(config.services).toBe(appointmentServices);
            expect(config.providers).toEqual(providers);
            done();
        });
    });

    it('should not fetch specialities if not configured', function (done) {
        appDescriptor.getConfigValue.and.returnValue(false);
        appointmentConfig().then(function (response) {
            expect(specialityService.getAllSpecialities).not.toHaveBeenCalled();
            expect(response.specialities).toBeUndefined();
            done();
        });
    });

});
