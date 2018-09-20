'use strict';

describe('AppointmentViewModel', function () {
    var appointmentViewModel, config;

    var appointmentResponse = {
        uuid: 'b2b23e00-fb5e-4400-8783-758aeaaf583c',
        appointmentNumber: '0000',
        patient: {
            identifier: 'GAN203008',
            name: 'test validation',
            uuid: 'a1cec3d9-aaab-4cbc-89c1-2e96bb202b9a'
        },
        service: {
            appointmentServiceId: 77,
            name: 'serviceHavingT',
            description: 'ajlskdfjaksd',
            speciality: {
                name: 'Cardiology',
                uuid: '664b48a1-7ce1-11e7-aaf1-080027e15975'
            },
            startTime: '08:30:00',
            endTime: '16:50:00',
            maxAppointmentsLimit: 34,
            durationMins: null,
            location: {
                name: 'Ganiyari',
                uuid: 'c1e42932-3f10-11e4-adec-0800271c1b75'
            },
            uuid: '6a8455a0-7080-4701-92bd-05bb1c903d85',
            color: '#DC143C',
            creatorName: null
        },
        serviceType: {
            duration: 30,
            name: 'type1',
            uuid: 'f5203cea-f4d2-4cd9-b7d2-b00f7e8890e9'
        },
        providers: [
            {
                name: "Super Man",
                uuid: "c1c26908-3f10-11e4-adec-0800271c1b75"
            }
        ],
        location: {
            name: 'Ganiyari',
            uuid: 'c1e42932-3f10-11e4-adec-0800271c1b75'
        },
        startDateTime: 1502210400000,
        endDateTime: 1502212200000,
        appointmentKind: 'WalkIn',
        status: 'Scheduled',
        comments: 'Consult the surgeon'
    };

    beforeEach(function () {
        var locations = [{display: 'Ganiyari', uuid: 'c1e42932-3f10-11e4-adec-0800271c1b75'},
                     {display: 'Registration Desk', uuid: 2}];
        var specialities = [{name: "Ortho", uuid: "96a2b38c-18d8-4603-94cd-e2f806251870"},
                        {name: "Cardiology", uuid: "664b48a1-7ce1-11e7-aaf1-080027e15975"}];
        var services = [{
            appointmentServiceId: 77,
            name: "CardioService",
            description: "For Heart Diseases",
            speciality: {
                name: "Cardiology",
                uuid: "664b48a1-7ce1-11e7-aaf1-080027e15975"
            },
            startTime: "08:30:00",
            endTime: "16:50:00",
            maxAppointmentsLimit: 34,
            durationMins: null,
            location: {
                name: "Ganiyari",
                uuid: "c1e42932-3f10-11e4-adec-0800271c1b75"
            },
            uuid: "6a8455a0-7080-4701-92bd-05bb1c903d85",
            color: "#DC143C"
        },
        {
            appointmentServiceId: 78,
            name: "cardiology",
            description: null,
            speciality: {},
            startTime: "04:20:00",
            endTime: "16:05:00",
            maxAppointmentsLimit: 40,
            durationMins: null,
            location: {},
            uuid: "0f59beb7-827a-41d5-a4ad-7728194e38a3",
            color: "#006400"
        }];
        var providers = [
            {
                name: "LABSYSTEM - labsystem system",
                uuid: "7d162c29-3f12-11e4-adec-0800271c1b75"
            },
            {
                name: "Super Man",
                uuid: "c1c26908-3f10-11e4-adec-0800271c1b75"
            }
        ];
        var selectedService = {
            appointmentServiceId: 77,
            name: "CardioService",
            description: "For Heart Diseases",
            speciality: {
                name: "Cardiology",
                uuid: "664b48a1-7ce1-11e7-aaf1-080027e15975"
            },
            startTime: "08:30:00",
            endTime: "16:50:00",
            maxAppointmentsLimit: 34,
            durationMins: null,
            location: {
                name: "Ganiyari",
                uuid: "c1e42932-3f10-11e4-adec-0800271c1b75"
            },
            uuid: "6a8455a0-7080-4701-92bd-05bb1c903d85",
            color: "#DC143C",
            serviceTypes: [{duration: 30, name: 'type1', uuid: 'f5203cea-f4d2-4cd9-b7d2-b00f7e8890e9'}]};
        config = {
            locations: locations,
            specialities: specialities,
            services: services,
            providers: providers,
            selectedService: selectedService
        };
        appointmentViewModel = Bahmni.Appointments.AppointmentViewModel.create(appointmentResponse, config);
    });

    it('should parse the appointment response', function () {
        expect(appointmentViewModel.uuid).toBe(appointmentResponse.uuid);
        expect(appointmentViewModel.patient).toEqual({label: appointmentResponse.patient.name + " (" + appointmentResponse.patient.identifier + ")", uuid: appointmentResponse.patient.uuid});
        expect(appointmentViewModel.speciality).toBe(config.specialities[1]);
        expect(appointmentViewModel.service).toBe(config.services[0]);
        expect(appointmentViewModel.serviceType).toBe(config.selectedService.serviceTypes[0]);
        expect(appointmentViewModel.providers[0]).toEqual(config.providers[1]);
        expect(appointmentViewModel.location).toBe(config.locations[0]);
        expect(appointmentViewModel.date).toEqual(new Date(moment(appointmentResponse.startDateTime)));
        expect(appointmentViewModel.startTime).toBe(moment(appointmentResponse.startDateTime).format('hh:mm a'));
        expect(appointmentViewModel.endTime).toBe(moment(appointmentResponse.endDateTime).format('hh:mm a'));
        expect(appointmentViewModel.appointmentKind).toBe(appointmentResponse.appointmentKind);
        expect(appointmentViewModel.status).toBe(appointmentResponse.status);
        expect(appointmentViewModel.comments).toBe(appointmentResponse.comments);
    });
});
