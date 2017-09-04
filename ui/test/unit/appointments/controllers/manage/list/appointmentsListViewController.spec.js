'use strict';

describe('AppointmentsListViewController', function () {
    var controller, scope, stateparams, spinner, appointmentsService, appService, appDescriptor, _appointmentsFilter;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, $stateParams, appointmentsFilter) {
            scope = $rootScope.$new();
            controller = $controller;
            stateparams = $stateParams;
            _appointmentsFilter = appointmentsFilter;
            appointmentsService = jasmine.createSpyObj('appointmentsService', ['getAllAppointments']);
            appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({}));
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            appDescriptor.getConfigValue.and.returnValue(true);
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            spinner.forPromise.and.callFake(function () {
                return {
                    then: function () {
                        return {};
                    }
                };
            });
        });
    });

    var createController = function () {
        controller('AppointmentsListViewController', {
            $scope: scope,
            spinner: spinner,
            appointmentsService: appointmentsService,
            appService: appService,
            $stateParams: stateparams,
            appointmentsFilter: _appointmentsFilter
        });
    };

    beforeEach(function () {
        createController();
    });

    it("should initialize today's date if not viewDate is provided in stateParams", function () {
        var today = moment().startOf('day').toDate();
        expect(scope.startDate).toEqual(today);
    });

    it('should initialize to viewDate in stateParams if provided', function () {
        stateparams = {
            viewDate: moment("2017-08-20").toDate()
        };
        createController();
        expect(scope.startDate).toEqual(stateparams.viewDate);
    });

    it("should initialize enable service types and enable specialities from config", function () {
        expect(scope.enableServiceTypes).toBeTruthy();
        expect(scope.enableSpecialities).toBeTruthy();
    });

    it('should get appointments for date', function () {
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);
        expect(stateparams.viewDate).toEqual(viewDate);
        expect(appointmentsService.getAllAppointments).toHaveBeenCalledWith({forDate: viewDate});
        expect(appointmentsService.selectedAppointment).toBeUndefined();
        expect(spinner.forPromise).toHaveBeenCalled();
    });

    it('should select an appointment', function () {
        var appointment1 = {patient: {name: 'patient1'}};
        var appointment2 = {patient: {name: 'patient2'}};
        scope.appointments = [appointment1, appointment2];
        scope.select(appointment2);
        expect(scope.selectedAppointment).toBe(appointment2);
        expect(scope.isSelected(scope.appointments[0])).toBeFalsy();
        expect(scope.isSelected(scope.appointments[1])).toBeTruthy();
    });

    it('should unselect an appointment if is selected', function () {
        var appointment1 = {patient: {name: 'patient1'}};
        var appointment2 = {patient: {name: 'patient2'}};
        scope.appointments = [appointment1, appointment2];
        scope.select(appointment2);
        expect(scope.selectedAppointment).toBe(appointment2);
        expect(scope.isSelected(scope.appointments[1])).toBeTruthy();
        scope.select(appointment2);
        expect(scope.selectedAppointment).toBeUndefined();
        expect(scope.isSelected(scope.appointments[1])).toBeFalsy();
    });

    it("should filter appointments on loading list view", function () {
        var appointments = [{
            "uuid": "347ae565-be21-4516-b573-103f9ce84a20",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203006",
                "name": "patient name",
                "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
            },
            "service": {
                "appointmentServiceId": 4,
                "name": "Ophthalmology",
                "description": "",
                "speciality": {},
                "startTime": "",
                "endTime": "",
                "maxAppointmentsLimit": null,
                "durationMins": 10,
                "location": {},
                "uuid": "02666cc6-5f3e-4920-856d-ab7e28d3dbdb",
                "color": "#006400",
                "creatorName": null
            },
            "serviceType": null,
            "provider": null,
            "location": null,
            "startDateTime": 1503891000000,
            "endDateTime": 1503900900000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }, {
            "uuid": "348d8416-58e1-48a4-b7db-44261c4d1798",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203006",
                "name": "patient name",
                "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
            },
            "service": {
                "appointmentServiceId": 5,
                "name": "Cardiology",
                "description": null,
                "speciality": {},
                "startTime": "",
                "endTime": "",
                "maxAppointmentsLimit": null,
                "durationMins": null,
                "location": {},
                "uuid": "2049ddaa-1287-450e-b4a3-8f523b072827",
                "color": "#006400",
                "creatorName": null
            },
            "serviceType": null,
            "provider": null,
            "location": null,
            "startDateTime": 1503887400000,
            "endDateTime": 1503889200000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }, {
            "uuid": "8f895c2d-130d-4e12-a621-7cb6c16a2095",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203006",
                "name": "patient name",
                "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
            },
            "service": {
                "appointmentServiceId": 5,
                "name": "Cardiology",
                "description": null,
                "speciality": {},
                "startTime": "",
                "endTime": "",
                "maxAppointmentsLimit": null,
                "durationMins": null,
                "location": {},
                "uuid": "2049ddaa-1287-450e-b4a3-8f523b072827",
                "color": "#006400",
                "creatorName": null
            },
            "serviceType": null,
            "provider": {"name": "Super Man", "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75"},
            "location": null,
            "startDateTime": 1503923400000,
            "endDateTime": 1503925200000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }];
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: appointments}));
        stateparams.filterParams = {serviceUuids: ["02666cc6-5f3e-4920-856d-ab7e28d3dbdb"]};
        createController();
        expect(scope.appointments).toBe(appointments);
        expect(scope.filteredAppointments.length).toEqual(1);
        expect(scope.filteredAppointments[0]).toEqual(appointments[0]);
    });
    it("should display seached patient appointment history", function () {
        var appointments = [{
            "uuid": "347ae565-be21-4516-b573-103f9ce84a20",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203006",
                "name": "patient name",
                "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
            },
            "service": {
                "appointmentServiceId": 4,
                "name": "Ophthalmology",
                "description": "",
                "speciality": {},
                "startTime": "",
                "endTime": "",
                "maxAppointmentsLimit": null,
                "durationMins": 10,
                "location": {},
                "uuid": "02666cc6-5f3e-4920-856d-ab7e28d3dbdb",
                "color": "#006400",
                "creatorName": null
            },
            "serviceType": null,
            "provider": null,
            "location": null,
            "startDateTime": 1503891000000,
            "endDateTime": 1503900900000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }, {
            "uuid": "348d8416-58e1-48a4-b7db-44261c4d1798",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203006",
                "name": "patient name",
                "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
            },
            "service": {
                "appointmentServiceId": 5,
                "name": "Cardiology",
                "description": null,
                "speciality": {},
                "startTime": "",
                "endTime": "",
                "maxAppointmentsLimit": null,
                "durationMins": null,
                "location": {},
                "uuid": "2049ddaa-1287-450e-b4a3-8f523b072827",
                "color": "#006400",
                "creatorName": null
            },
            "serviceType": null,
            "provider": null,
            "location": null,
            "startDateTime": 1503887400000,
            "endDateTime": 1503889200000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }, {
            "uuid": "8f895c2d-130d-4e12-a621-7cb6c16a2095",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203003",
                "name": "John Smith",
                "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
            },
            "service": {
                "appointmentServiceId": 5,
                "name": "Cardiology",
                "description": null,
                "speciality": {},
                "startTime": "",
                "endTime": "",
                "maxAppointmentsLimit": null,
                "durationMins": null,
                "location": {},
                "uuid": "2049ddaa-1287-450e-b4a3-8f523b072827",
                "color": "#006400",
                "creatorName": null
            },
            "serviceType": null,
            "provider": {"name": "Super Man", "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75"},
            "location": null,
            "startDateTime": 1503923400000,
            "endDateTime": 1503925200000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }];
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: appointments}));
        createController()
        expect(scope.appointments).toBe(appointments);
        expect(scope.filteredAppointments.length).toEqual(3);
        expect(scope.searchedPatient).toBeFalsy();
        scope.displaySearchedPatient([appointments[1]]);
        expect(scope.filteredAppointments.length).toEqual(1);
        expect(scope.searchedPatient).toBeTruthy();
    });
    describe("goBackToPreviousView", function () {
        var appointments;
        beforeEach(function () {
            appointments = [{
                "uuid": "347ae565-be21-4516-b573-103f9ce84a20",
                "appointmentNumber": "0000",
                "patient": {
                    "identifier": "GAN203006",
                    "name": "patient name",
                    "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
                },
                "service": {
                    "appointmentServiceId": 4,
                    "name": "Ophthalmology",
                    "description": "",
                    "speciality": {},
                    "startTime": "",
                    "endTime": "",
                    "maxAppointmentsLimit": null,
                    "durationMins": 10,
                    "location": {},
                    "uuid": "02666cc6-5f3e-4920-856d-ab7e28d3dbdb",
                    "color": "#006400",
                    "creatorName": null
                },
                "serviceType": null,
                "provider": null,
                "location": null,
                "startDateTime": 1503891000000,
                "endDateTime": 1503900900000,
                "appointmentKind": "Scheduled",
                "status": "Scheduled",
                "comments": null
            }, {
                "uuid": "348d8416-58e1-48a4-b7db-44261c4d1798",
                "appointmentNumber": "0000",
                "patient": {
                    "identifier": "GAN203006",
                    "name": "patient name",
                    "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
                },
                "service": {
                    "appointmentServiceId": 5,
                    "name": "Cardiology",
                    "description": null,
                    "speciality": {},
                    "startTime": "",
                    "endTime": "",
                    "maxAppointmentsLimit": null,
                    "durationMins": null,
                    "location": {},
                    "uuid": "2049ddaa-1287-450e-b4a3-8f523b072827",
                    "color": "#006400",
                    "creatorName": null
                },
                "serviceType": null,
                "provider": null,
                "location": null,
                "startDateTime": 1503887400000,
                "endDateTime": 1503889200000,
                "appointmentKind": "Scheduled",
                "status": "Scheduled",
                "comments": null
            }, {
                "uuid": "8f895c2d-130d-4e12-a621-7cb6c16a2095",
                "appointmentNumber": "0000",
                "patient": {
                    "identifier": "GAN203003",
                    "name": "John Smith",
                    "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
                },
                "service": {
                    "appointmentServiceId": 5,
                    "name": "Cardiology",
                    "description": null,
                    "speciality": {},
                    "startTime": "",
                    "endTime": "",
                    "maxAppointmentsLimit": null,
                    "durationMins": null,
                    "location": {},
                    "uuid": "2049ddaa-1287-450e-b4a3-8f523b072827",
                    "color": "#006400",
                    "creatorName": null
                },
                "serviceType": null,
                "provider": {"name": "Super Man", "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75"},
                "location": null,
                "startDateTime": 1503923400000,
                "endDateTime": 1503925200000,
                "appointmentKind": "Scheduled",
                "status": "Scheduled",
                "comments": null
            }];
            appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: appointments}));
        })
        it("should reset filtered appointments to its previous data", function () {
            createController()
            scope.filteredAppointments = appointments;
            scope.displaySearchedPatient([appointments[1]]);
            expect(scope.filteredAppointments.length).toEqual(1);
            scope.goBackToPreviousView();
            expect(scope.filteredAppointments.length).toEqual(3);
            expect(scope.searchedPatient).toBeFalsy();
        });
        it("should sort appointments by the sort column", function () {
            scope.filterParams = {
                providerUuids: [],
                serviceUuids: [],
                serviceTypeUuids: [],
                statusList: []
            };
            var appointment1 = {
                patient: {name: 'patient2', identifier: "IQ00001"},
                comments: "comments1",
                status: "Completed",
                appointmentKind: "Completed",
                provider: {name: "provider1"},
                endDateTime: 100000,
                startDateTime: 200000,
                service: {
                    name: "service1",
                    serviceType: {name: "type1"},
                    speciality: {name: "speciality1"},
                    location: {name: "location1"}
                }
            };
            var appointment2 = {
                patient: {name: 'patient1', identifier: "IQ00002"},
                comments: "comments2",
                status: "Scheduled",
                appointmentKind: "Scheduled",
                provider: {name: "provider2"},
                endDateTime: 200000,
                startDateTime: 300000,
                service: {
                    name: "service2",
                    serviceType: {name: "type2"},
                    speciality: {name: "speciality2"},
                    location: {name: "location2"}
                }
            };
            var appointments = [appointment1, appointment2];
            appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: appointments}));
            createController();
            scope.sortSurgicalAppointmentsBy('patient.name');
            expect(scope.sortColumn).toEqual('patient.name');
            expect(scope.appointments.length).toEqual(2);
            expect(scope.appointments[0].patient.name).toEqual("patient2");
            expect(scope.appointments[1].patient.name).toEqual("patient1");

            scope.sortSurgicalAppointmentsBy('comments');
            expect(scope.sortColumn).toEqual('comments');
            expect(scope.appointments.length).toEqual(2);
            expect(scope.appointments[0].comments).toEqual("comments1");
            expect(scope.appointments[1].comments).toEqual("comments2");

            scope.sortSurgicalAppointmentsBy('status');
            expect(scope.sortColumn).toEqual('status');
            expect(scope.appointments.length).toEqual(2);
            expect(scope.appointments[0].status).toEqual("Completed");
            expect(scope.appointments[1].status).toEqual("Scheduled");

            scope.sortSurgicalAppointmentsBy('patient.identifier');
            expect(scope.sortColumn).toEqual('patient.identifier');
            expect(scope.appointments.length).toEqual(2);
            expect(scope.appointments[0].patient.identifier).toEqual("IQ00001");
            expect(scope.appointments[1].patient.identifier).toEqual("IQ00002");

            scope.sortSurgicalAppointmentsBy('provider.name');
            expect(scope.sortColumn).toEqual('provider.name');
            expect(scope.appointments.length).toEqual(2);
            expect(scope.appointments[0].provider.name).toEqual("provider1");
            expect(scope.appointments[1].provider.name).toEqual("provider2");

            scope.sortSurgicalAppointmentsBy('service.location.name');
            expect(scope.sortColumn).toEqual('service.location.name');
            expect(scope.appointments.length).toEqual(2);
            expect(scope.appointments[0].service.location.name).toEqual("location1");
            expect(scope.appointments[1].service.location.name).toEqual("location2");

            scope.sortSurgicalAppointmentsBy('service.serviceType.name');
            expect(scope.sortColumn).toEqual('service.serviceType.name');
            expect(scope.appointments.length).toEqual(2);
            expect(scope.appointments[0].service.serviceType.name).toEqual("type1");
            expect(scope.appointments[1].service.serviceType.name).toEqual("type2");

            scope.sortSurgicalAppointmentsBy('service.name');
            expect(scope.sortColumn).toEqual('service.name');
            expect(scope.appointments.length).toEqual(2);
            expect(scope.appointments[0].service.name).toEqual("service1");
            expect(scope.appointments[1].service.name).toEqual("service2");

            scope.sortSurgicalAppointmentsBy('endDateTime');
            expect(scope.sortColumn).toEqual('endDateTime');
            expect(scope.appointments.length).toEqual(2);
            expect(scope.appointments[0].endDateTime).toEqual(100000);
            expect(scope.appointments[1].endDateTime).toEqual(200000);

            scope.sortSurgicalAppointmentsBy('startDateTime');
            expect(scope.sortColumn).toEqual('startDateTime');
            expect(scope.appointments.length).toEqual(2);
            expect(scope.appointments[0].startDateTime).toEqual(200000);
            expect(scope.appointments[1].startDateTime).toEqual(300000);
        });


        it("should reverse sort appointments if sorted on the same column consecutively", function () {
            scope.filterParams = {
                providerUuids: [],
                serviceUuids: [],
                serviceTypeUuids: [],
                statusList: []
            };
            var appointment1 = {
                patient: {name: 'patient2', identifier: "IQ00001"},
                comments: "comments1",
                status: "Completed",
                appointmentKind: "Completed",
                provider: {name: "provider1"},
                endDateTime: 100000,
                startDateTime: 200000,
                service: {
                    name: "service1",
                    serviceType: {name: "type1"},
                    speciality: {name: "speciality1"},
                    location: {name: "location1"}
                }
            };
            var appointment2 = {
                patient: {name: 'patient1', identifier: "IQ00002"},
                comments: "comments2",
                status: "Scheduled",
                appointmentKind: "Scheduled",
                provider: {name: "provider2"},
                endDateTime: 200000,
                startDateTime: 300000,
                service: {
                    name: "service2",
                    serviceType: {name: "type2"},
                    speciality: {name: "speciality2"},
                    location: {name: "location2"}
                }
            };
            var appointments = [appointment1, appointment2];
            appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: appointments}));
            createController();
            scope.sortSurgicalAppointmentsBy('patient.name');
            expect(scope.reverseSort).toEqual(true);
            expect(scope.sortColumn).toEqual('patient.name');
            expect(scope.appointments.length).toEqual(2);
            expect(scope.appointments[0].patient.name).toEqual("patient2");
            expect(scope.appointments[1].patient.name).toEqual("patient1");

            scope.sortSurgicalAppointmentsBy('patient.identifier');
            expect(scope.reverseSort).toEqual(false);
            expect(scope.sortColumn).toEqual('patient.identifier');
            expect(scope.appointments.length).toEqual(2);
            expect(scope.appointments[0].patient.identifier).toEqual("IQ00001");
            expect(scope.appointments[1].patient.identifier).toEqual("IQ00002");
        });

        it("should have table info", function () {
            var tableInfo = [{heading: 'APPOINTMENT_PATIENT_ID', sortInfo: 'patient.identifier', enable: true},
                {heading: 'APPOINTMENT_PATIENT_NAME', sortInfo: 'patient.name', class: true, enable: true},
                {heading: 'APPOINTMENT_DATE', sortInfo: 'appointmentDate', enable: true},
                {heading: 'APPOINTMENT_START_TIME_KEY', sortInfo: 'startDateTime', enable: true},
                {heading: 'APPOINTMENT_END_TIME_KEY', sortInfo: 'endDateTime', enable: true},
                {heading: 'APPOINTMENT_PROVIDER', sortInfo: 'provider.name', class: true, enable: true},
                {
                    heading: 'APPOINTMENT_SERVICE_SPECIALITY_KEY',
                    sortInfo: 'service.speciality.name',
                    enable: scope.enableSpecialities
                },
                {heading: 'APPOINTMENT_SERVICE', sortInfo: 'service.name', enable: true},
                {
                    heading: 'APPOINTMENT_SERVICE_TYPE_FULL',
                    sortInfo: 'service.serviceType.name',
                    class: true,
                    enable: scope.enableServiceTypes
                },
                {heading: 'APPOINTMENT_WALK_IN', sortInfo: 'appointmentKind', enable: true},
                {
                    heading: 'APPOINTMENT_SERVICE_LOCATION_KEY',
                    sortInfo: 'service.location.name',
                    class: true,
                    enable: true
                },
                {heading: 'APPOINTMENT_STATUS', sortInfo: 'status', enable: true},
                {heading: 'APPOINTMENT_CREATE_NOTES', sortInfo: 'comments', enable: true}];
            createController();
            expect(scope.tableInfo).toEqual(tableInfo)
        });
    });
});
