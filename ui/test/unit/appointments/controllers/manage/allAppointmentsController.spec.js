'use strict';

describe('AllAppointmentsController', function () {
    var controller, scope, state, location, appService, appDescriptor, appointmentsServiceService;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller;
            state = jasmine.createSpyObj('state', ['go']);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            location = jasmine.createSpyObj('$location', ['url']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['getAllServicesWithServiceTypes']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            appDescriptor.getConfigValue.and.returnValue(true);
            appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({}));
        });
    });

    var createController = function () {
        controller('AllAppointmentsController', {
            $scope: scope,
            appService: appService,
            appointmentsServiceService: appointmentsServiceService,
            $location: location,
            $state: state
        });
    };
    it("should initialize enable calendar view from config", function () {
        createController();
        expect(scope.enableCalendarView).toBeTruthy();
    });

    it("should navigate to calendar view if calendar button in pressed", function () {
        state.params = {filterParams: {serviceUuids: ['serviceUuid1']}};
        createController();
        scope.navigateTo('calendar');
        expect(state.go).toHaveBeenCalledWith('home.manage.appointments.calendar', state.params, {reload: false});
    });

    it("should navigate to list view if list button is pressed", function () {
        state.params = {filterParams: {serviceUuids: ['serviceUuid1']}};
        createController();
        scope.navigateTo('list');
        expect(state.go).toHaveBeenCalledWith('home.manage.appointments.list', state.params, {reload: false});
    });

    it("should get tabName from state.current", function () {
        state = {
            name: "home.manage.appointments.calendar",
            url: '/calendar',
            current: {
                tabName: 'calendar'
            }
        };
        createController();
        var tabName = scope.getCurrentAppointmentTabName();
        expect(tabName).toBe("calendar");
    });

    it("should get All services with speciality and service types", function () {
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({data:[{
            appointmentServiceId: 1,
            name: "ortho",
            speciality: {
                name: "Cardiology",
                uuid: "bdbb1d1e-87c8-11e7-93b0-080027e99513"
            },
            startTime: "",
            endTime: "",
            maxAppointmentsLimit: 12,
            durationMins: 60,
            location: {},
            uuid: "d3f5062e-b92d-4c70-8d22-b199dcb65a2c",
            color: "#006400",
            weeklyAvailability: [],
            serviceTypes: [
                {
                    duration: 15,
                    name: "maxillo",
                    uuid: "de849ecd-47ad-4610-8080-20e7724b2df6"
                }]
        }]}));
        createController();
        expect(appointmentsServiceService.getAllServicesWithServiceTypes).toHaveBeenCalled();
        expect(scope.servicesWithTypes[0].appointmentServiceId).toBe(1);
        expect(scope.servicesWithTypes[0].name).toBe("ortho");
        expect(scope.servicesWithTypes[0].serviceTypes[0].name).toBe("maxillo");
        expect(scope.servicesWithTypes[0].speciality.name).toBe("Cardiology");
    });

    it("should map specialities to ivh tree", function () {
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({data:[{
            appointmentServiceId: 1,
            name: "ortho",
            speciality: {
                name: "Cardiology",
                uuid: "bdbb1d1e-87c8-11e7-93b0-080027e99513"
            },
            startTime: "",
            endTime: "",
            maxAppointmentsLimit: 12,
            durationMins: 60,
            location: {},
            uuid: "d3f5062e-b92d-4c70-8d22-b199dcb65a2c",
            color: "#006400",
            weeklyAvailability: [],
            serviceTypes: [
                {
                    duration: 15,
                    name: "maxillo",
                    uuid: "de849ecd-47ad-4610-8080-20e7724b2df6"
                }]
        }]}));
        createController();
        expect(scope.mappedSpecialities[0].label).toBe("Cardiology");
        expect(scope.mappedSpecialities[0].children[0].label).toBe("ortho");
        expect(scope.mappedSpecialities[0].children[0].children[0].label).toBe("maxillo");
    });

    it("should map selected services to state params", function(){
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({data:[{
            appointmentServiceId: 1,
            name: "ortho",
            speciality: {
                name: "Cardiology",
                uuid: "bdbb1d1e-87c8-11e7-93b0-080027e99513"
            },
            startTime: "",
            endTime: "",
            maxAppointmentsLimit: 12,
            durationMins: 60,
            location: {},
            uuid: "d3f5062e-b92d-4c70-8d22-b199dcb65a2c",
            color: "#006400",
            weeklyAvailability: [],
            serviceTypes: [
                {
                    duration: 15,
                    name: "maxillo",
                    uuid: "de849ecd-47ad-4610-8080-20e7724b2df6"
                }]
        }]}));
        createController();
        state.params = {}
        scope.selectedSpecialities = [
            {
                "label": "Speciality",
                "children": [
                    {
                        "label": "Dermatology",
                        "value": "75c006aa-d3dd-4848-9735-03aee74ae27e",
                        "children": [
                            {
                                "label": "type1",
                                "value": "f9556d31-2c42-4c7b-8d05-48aceeae0c9a",
                                "selected": true
                            }
                        ],
                        "selected": true
                    },
                    {
                        "label": "Ophthalmology",
                        "value": "02666cc6-5f3e-4920-856d-ab7e28d3dbdb",
                        "children": [
                            {
                                "label": "type1",
                                "value": "6f59ba62-ddf4-46bc-b866-c09ae7b8200f",
                                "selected": false
                            }
                        ],
                        "selected": false
                    }
                ],
                "selected": false
            }
        ];
        scope.applyFilter();
        expect(state.params.filterParams.serviceUuids.length).toEqual(1);
        expect(state.params.filterParams.serviceUuids[0]).toEqual("75c006aa-d3dd-4848-9735-03aee74ae27e");
    });
});
