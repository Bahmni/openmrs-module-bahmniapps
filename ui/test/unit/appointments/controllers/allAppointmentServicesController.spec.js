'use strict';

describe("AllAppointmentServicesController", function () {
    var controller, location, scope, appointmentsServiceService, spinnerService;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function($controller, $rootScope, $location) {
            scope = $rootScope.$new();
            location = $location;
            controller = $controller;
            appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['getAllServices']);

            spinnerService = jasmine.createSpyObj('spinnerService', ['forPromise']);
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
            spinner: spinnerService
        });
    };

    it('should get all existing services', function () {
        var response = [{name: "cardio", description: "cardiology", speciality: {name: "General", uuid: "someuid"}}];
        appointmentsServiceService.getAllServices.and.returnValue(specUtil.simplePromise({data: response}));
        createController();
        expect(scope.appointmentServices).toEqual(response);
    });
});
