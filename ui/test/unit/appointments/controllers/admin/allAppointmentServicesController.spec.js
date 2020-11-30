'use strict';

describe("AllAppointmentServicesController", function () {
    var controller, location, scope, appointmentsServiceService, spinnerService, appService, appDescriptor, ngDialog;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function($controller, $rootScope, $location) {
            scope = $rootScope.$new();
            location = $location;
            controller = $controller;
            appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['getAllServices']);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            appDescriptor.getConfigValue.and.returnValue(true);
            spinnerService = jasmine.createSpyObj('spinnerService', ['forPromise']);
            ngDialog = jasmine.createSpyObj('ngDialog', ['open']);
        })});

    var createController = function () {
        spinnerService.forPromise.and.callFake(function () {
            return {
                then: function () {
                    return {};
                }
            };
        });

        controller('AllAppointmentServicesController', {
            $scope: scope,
            $location: location,
            appointmentsServiceService: appointmentsServiceService,
            spinner: spinnerService,
            appService: appService,
            ngDialog: ngDialog
        });
    };

    it('should get all existing services', function () {
        var response = [{name: "cardio", description: "cardiology", speciality: {name: "General", uuid: "someuid"}}];
        appointmentsServiceService.getAllServices.and.returnValue(specUtil.simplePromise({data: response}));
        createController();
        expect(scope.enableSpecialities).toBe(true);
        expect(scope.appointmentServices).toEqual(response);
    });

    it('should open dialog for deleting appointmentservice', function () {
        var services = [{name: "cardio", description: "cardiology", speciality: {name: "General", uuid: "someuid"}}];
        appointmentsServiceService.getAllServices.and.returnValue(specUtil.simplePromise({data: services}));
        createController();

        scope.deleteAppointmentService(services[0]);

        expect(ngDialog.open).toHaveBeenCalledWith({template: 'views/admin/deleteAppointmentService.html', className: 'ngdialog-theme-default', data: {service: services[0]}, controller: 'deleteAppointmentServiceController'});
    });
});
