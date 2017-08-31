'use strict';

describe('AppointmentsFilterController', function () {
    var controller, scope, state, location, appService, appDescriptor, appointmentsServiceService, ivhTreeviewMgr, q;
    ivhTreeviewMgr = jasmine.createSpyObj('ivhTreeviewMgr', ['deselectAll']);
    var providerService = jasmine.createSpyObj('providerService', ['list']);

    var servicesWithTypes = {
        data: [{
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
        }]
    };
    var providers = {
        data: {
            results: [{
                "uuid": "f9badd80-ab76-11e2-9e96-0800200c9a66",
                "display": "1-Jane"
            }, {
                "uuid": "df17bca9-ff9b-4a73-bac7-f302fc688974",
                "display": "2-June"
            }]
        }
    };

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller;
            state = jasmine.createSpyObj('state', ['go']);
            q = jasmine.createSpyObj('$q', ['all']);
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            location = jasmine.createSpyObj('$location', ['url']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['getAllServicesWithServiceTypes']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            appDescriptor.getConfigValue.and.returnValue(true);
            appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({}));
            q.all.and.returnValue(specUtil.simplePromise({}));
        });
    });

    providerService.list.and.returnValue(specUtil.simplePromise(providers));

    var createController = function () {
        controller('AppointmentsFilterController', {
            $scope: scope,
            appService: appService,
            appointmentsServiceService: appointmentsServiceService,
            $location: location,
            $state: state,
            ivhTreeviewMgr: ivhTreeviewMgr,
            $q: q
        });
    };



    it("should get tabName from state.current", function () {
        state = {
            name: "home.manage.appointments.calendar",
            url: '/calendar',
            current: {
                tabName: 'calendar'
            }
        };
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        createController();
        var tabName = scope.getCurrentAppointmentTabName();
        expect(tabName).toBe("calendar");
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
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        createController();
        expect(scope.mappedSpecialities[0].label).toBe("Cardiology");
        expect(scope.mappedSpecialities[0].children[0].label).toBe("ortho");
        expect(scope.mappedSpecialities[0].children[0].children[0].label).toBe("maxillo");
    });

    it("should map selected services to state params", function(){
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
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
        state.params = {};
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

    it('should set service types to state params', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({}));
        createController();
        state.params = {};
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
                            },
                            {
                                "label": "type2",
                                "value": "f9556d31-2c42-4c7b-8d05-48aceeae0900",
                                "selected": false
                            }
                        ],
                        "selected": false
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
        expect(state.params.filterParams.serviceTypeUuids.length).toEqual(1);
        expect(state.params.filterParams.serviceTypeUuids[0]).toEqual("f9556d31-2c42-4c7b-8d05-48aceeae0c9a");
    });

    it('should select service types only when the service is not selected', function () {
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({}));
        createController();
        state.params = {};
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
                            },
                            {
                                "label": "type2",
                                "value": "f9556d31-2c42-4c7b-8d05-48aceeae0900",
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
                                "selected": true
                            }
                        ],
                        "selected": true
                    }
                ],
                "selected": false
            }
        ];
        scope.applyFilter();
        expect(state.params.filterParams.serviceTypeUuids.length).toEqual(0);
        expect(state.params.filterParams.serviceUuids.length).toEqual(2);
        expect(state.params.filterParams.serviceUuids[0]).toEqual("75c006aa-d3dd-4848-9735-03aee74ae27e");
        expect(state.params.filterParams.serviceUuids[1]).toEqual("02666cc6-5f3e-4920-856d-ab7e28d3dbdb");
    });

    it('should reset ivh Tree, reset the filter and apply them on appointments', function () {
        state.params={};
        state.params.filterParams = {serviceUuids: ["someServiceUuid"], serviceTypeUuid: ["serviceTypeUuid"], providerUuids: [], statusList: []};
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise({ data: [{
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

        scope.selectedSpecialities = [ { label : 'Speciality', children : [ { label : 'Dermatology', value : '75c006aa-d3dd-4848-9735-03aee74ae27e', children : [ { label : 'type1', value : 'f9556d31-2c42-4c7b-8d05-48aceeae0c9a', selected : true }, { label : 'type2', value : 'f9556d31-2c42-4c7b-8d05-48aceeae0900', selected : true } ], selected : true }, { label : 'Ophthalmology', value : '02666cc6-5f3e-4920-856d-ab7e28d3dbdb', children : [ { label : 'type1', value : '6f59ba62-ddf4-46bc-b866-c09ae7b8200f', selected : true } ], selected : true } ], selected : false } ];
        createController();
        scope.resetFilter();
        expect(state.params.filterParams.serviceTypeUuids.length).toBe(0);
        expect(state.params.filterParams.serviceUuids.length).toBe(0);
        expect(state.params.filterParams.providerUuids.length).toBe(0);
        expect(state.params.filterParams.statusList.length).toBe(0);
        expect(scope.selectedStatusList.length).toBe(0);
        expect(scope.selectedProviders.length).toBe(0);
        expect(ivhTreeviewMgr.deselectAll).toHaveBeenCalledWith(scope.selectedSpecialities, false);
    });

    it('should get providers, statusList and specialities', function () {
        appointmentsServiceService.getAllServicesWithServiceTypes.and.returnValue(specUtil.simplePromise(servicesWithTypes));
        providerService.list.and.returnValue(specUtil.simplePromise(providers));
        q.all.and.returnValue(specUtil.simplePromise([servicesWithTypes, providers]));
        createController();
        expect(scope.statusList.length).toBe(6);
        expect(scope.providers.length).toBe(2);
    })

});
