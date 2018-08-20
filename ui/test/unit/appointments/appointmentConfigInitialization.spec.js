'use strict';

describe('AppointmentConfigInitialization', function () {
    var appointmentConfig, locationService, specialityService, appointmentsServiceService, providerService,
        appService, spinner, locations, specialities, appointmentServices, providers, appDescriptor, appointmentContext,
        availableProviders;
    beforeEach(function () {
        locations = [{display: 'OPD', uuid: 1}, {display: 'Registration Desk', uuid: 2}];
        locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
        locationService.getAllByTag.and.returnValue(specUtil.simplePromise({data: {results: locations}}));

        specialities = [{name: 'Ortho', uuid: '11da9590-cf11-5594-22zz-989e27121b22'}];
        specialityService = jasmine.createSpyObj('specialityService', ['getAllSpecialities']);
        specialityService.getAllSpecialities.and.returnValue(specUtil.simplePromise({data: specialities}));
        appointmentServices = [{
            name: 'Knee',
            description: 'treatment',
            uuid: 'serviceUuid',
            serviceTypes: [{name: 'type1', duration: 15}]
        }];
        appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['getAllServices', 'getService']);
        appointmentsServiceService.getAllServices.and.returnValue(specUtil.simplePromise({data: appointmentServices}));
        appointmentsServiceService.getService.and.returnValue(specUtil.simplePromise({data: appointmentServices[0]}));

        providerService = jasmine.createSpyObj('providerService', ['list']);
        providers =[
            {person: {display: 'Superman', uuid: "uuid5"}, attributes: []},
            {
                person: {display: 'Unknown Provider', uuid: "uuid1"},
                attributes: [{attributeType: {display: "Available for appointments"}, value: true, voided: false}],
                uuid: "uuid1",
                retired: false
            },
            {
                person: {display: 'mohima', uuid: "uuid4"},
                attributes: [{attributeType: {display: "Available for appointments"}, value: true, voided: true}],
                retired: false
            },
            {
                person: {display: 'mahmoud_h', uuid: "uuid3"},
                attributes: [{attributeType: {display: "Available for appointments"}, value: false, voided: false}]
            }, {
                person: {display: 'Saikumar', uuid: "uuid2"},
                attributes: [{attributeType: {display: "Available for appointments"}, value: true, voided: false}],
                uuid: "uuid1",
                retired: true
            }
        ];
        availableProviders = [{
            person: {display: 'Unknown Provider', uuid: "uuid1"},
            attributes: [{attributeType: {display: "Available for appointments"}, value: true, voided: false}],
            uuid: "uuid1",
            retired: false
        }];
        providerService.list.and.returnValue(specUtil.simplePromise({data: {results: providers}}));

        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        appDescriptor.getConfigValue.and.returnValue(true);

        spinner = jasmine.createSpyObj('spinner', ['forPromise', 'forAjaxPromise']);
        spinner.forPromise.and.callFake(function (param) {
            return param;
        });
        appointmentContext = {};
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
        appointmentConfig(appointmentContext).then(function (response) {
            expect(locationService.getAllByTag).toHaveBeenCalledWith('Appointment Location');
            expect(appointmentsServiceService.getAllServices).toHaveBeenCalled();
            expect(specialityService.getAllSpecialities).toHaveBeenCalled();
            var config = response;
            expect(config.locations).toBe(locations);
            expect(config.specialities).toBe(specialities);
            expect(config.services).toBe(appointmentServices);
            expect(config.providers).toEqual(availableProviders);
            done();
        });
    });

    it('should not include retired providers in providers list', function (done) {
        appointmentConfig(appointmentContext).then(function (response) {
            expect(response.providers).toEqual(availableProviders);
            done();
        });
    });

    it('should not fetch specialities if not configured', function (done) {
        appDescriptor.getConfigValue.and.returnValue(false);
        appointmentConfig(appointmentContext).then(function (response) {
            expect(specialityService.getAllSpecialities).not.toHaveBeenCalled();
            expect(response.specialities).toBeUndefined();
            done();
        });
    });

    it('should fetch selectedService if there is service', function (done) {
        appointmentContext.appointment = {service: {uuid: 'serviceUuid'}};
        appointmentConfig(appointmentContext).then(function (response) {
            expect(appointmentsServiceService.getService).toHaveBeenCalledWith('serviceUuid');
            expect(response.selectedService).toEqual(appointmentServices[0]);
            done();
        });
    });

    it('should not fetch selectedService if there is no service', function (done) {
        appointmentContext.appointment = {startDateTime: new Date()};
        appDescriptor.getConfigValue.and.returnValue(false);
        appointmentConfig(appointmentContext).then(function (response) {
            expect(appointmentsServiceService.getService).not.toHaveBeenCalled();
            expect(response.selectedService).toBeUndefined();
            done();
        });
    });

});
