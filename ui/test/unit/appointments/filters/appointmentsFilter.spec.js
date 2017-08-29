'use strict';

describe("appointmentsFilter", function () {
    var appointmentsFilter;
    beforeEach(module('bahmni.appointments'));
    beforeEach(inject(function($filter) {
        appointmentsFilter = $filter('appointments');
    }));

    var appointments = [{
        uuid: "956db6f7-cc43-447f-aa20-f91079cad573",
        appointmentNumber: "0000",
        patient: {identifier: "GAN203006", name: "patient name", uuid: "4175c013-a44c-4be6-bd87-6563675d2da1"},
        service: {
            appointmentServiceId: 1,
            name: "service1",
            location: {},
            uuid: "c526c72a-ae6a-446c-9337-42d1119bcb94",
            color: "#008000",
            creatorName: null
        },
        appointmentKind: "Scheduled",
        status: "Scheduled",
        comments: null
    },
        {
            uuid: "956db6f7-cc43-447f-aa20-f91079cad589",
            appointmentNumber: "0001",
            patient: {identifier: "GAN203006", name: "patient name", uuid: "4175c013-a44c-4be6-bd87-6563675d2da1"},
            service: {
                appointmentServiceId: 2,
                name: "service2",
                description: null,
                speciality: {},
                uuid: "c526c72a-ae6a-446c-9337-42d1119bcb45"
            },
            appointmentKind: "Scheduled",
            status: "Scheduled"
        }
    ];

    it('should filter appointments by service', function () {
       var filters = {serviceUuids :["c526c72a-ae6a-446c-9337-42d1119bcb94"]};
       var filteredAppointments = appointmentsFilter(appointments, filters);
       expect(filteredAppointments.length).toEqual(1);
       expect(filteredAppointments[0].service.uuid).toEqual("c526c72a-ae6a-446c-9337-42d1119bcb94");
    });

    it('should not filter appointments when the service list is empty', function () {
        var filters = {serviceUuids:[]};
        var filteredAppointments = appointmentsFilter(appointments, filters);
        expect(filteredAppointments.length).toEqual(2);
        expect(filteredAppointments[0].service.uuid).toEqual("c526c72a-ae6a-446c-9337-42d1119bcb94");
        expect(filteredAppointments[1].service.uuid).toEqual("c526c72a-ae6a-446c-9337-42d1119bcb45");
    });

    it('should filter appointments by service type', function () {
        var appointmentsForFilter = [{
            "uuid": "8f895c2d-130d-4e12-a621-7cb6c16a2095",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203006",
                "name": "patient name",
                "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
            },
            "service": {
                "appointmentServiceId": 5,
                "name": "Consultation",
                "speciality": {},
                "uuid": "2049ddaa-1287-450e-b4a3-8f523b072827",
                "color": "#006400",
                "creatorName": null
            },
            "serviceType": {"duration": 20, "name": "typeB", "uuid": "a416f7b8-86e1-4407-b7b7-006135e37898"},
            "provider": {"name": "Super Man", "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75"},
            "location": null,
            "startDateTime": 1503923400000,
            "endDateTime": 1503925200000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }, {
            "uuid": "4eced572-63ab-4cd7-8b19-9d12ee6b3580",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203006",
                "name": "patient name",
                "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
            },
            "service": {
                "appointmentServiceId": 6,
                "name": "Cardiomyopathy",
                "speciality": {"name": "Cardiology", "uuid": "5a63ba2f-8be0-11e7-acfb-0800274a5156"},
                "location": {},
                "uuid": "e9bbf8dc-6807-4b98-a28c-3671eeac6945",
                "color": "#006400",
                "creatorName": null
            },
            "serviceType": {"duration": 20, "name": "typeA", "uuid": "a416f7b8-86e1-4407-b7b7-006135e36cf5"},
            "provider": null,
            "location": null,
            "startDateTime": 1503912600000,
            "endDateTime": 1503913800000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }];
        var filters = {serviceTypeUuids :["a416f7b8-86e1-4407-b7b7-006135e36cf5"], serviceUuids:[]};
        var filteredAppointments = appointmentsFilter(appointmentsForFilter, filters);
        expect(filteredAppointments.length).toBe(1);
        expect(filteredAppointments[0].serviceType.uuid).toEqual("a416f7b8-86e1-4407-b7b7-006135e36cf5");
    });

    it('should return all appointments when filter is empty', function () {
        var appointmentsForFilter = [{
            "uuid": "8f895c2d-130d-4e12-a621-7cb6c16a2095",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203006",
                "name": "patient name",
                "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
            },
            "service": {
                "appointmentServiceId": 5,
                "name": "Consultation",
                "speciality": {},
                "uuid": "2049ddaa-1287-450e-b4a3-8f523b072827",
                "color": "#006400",
                "creatorName": null
            },
            "serviceType": {"duration": 20, "name": "typeB", "uuid": "a416f7b8-86e1-4407-b7b7-006135e37898"},
            "provider": {"name": "Super Man", "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75"},
            "location": null,
            "startDateTime": 1503923400000,
            "endDateTime": 1503925200000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }, {
            "uuid": "4eced572-63ab-4cd7-8b19-9d12ee6b3580",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203006",
                "name": "patient name",
                "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
            },
            "service": {
                "appointmentServiceId": 6,
                "name": "Cardiomyopathy",
                "speciality": {"name": "Cardiology", "uuid": "5a63ba2f-8be0-11e7-acfb-0800274a5156"},
                "location": {},
                "uuid": "e9bbf8dc-6807-4b98-a28c-3671eeac6945",
                "color": "#006400",
                "creatorName": null
            },
            "serviceType": {"duration": 20, "name": "typeA", "uuid": "a416f7b8-86e1-4407-b7b7-006135e36cf5"},
            "provider": null,
            "location": null,
            "startDateTime": 1503912600000,
            "endDateTime": 1503913800000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }];
        var filters = {};
        var filteredAppointments = appointmentsFilter(appointmentsForFilter, filters);
        expect(filteredAppointments.length).toBe(2);
        expect(filteredAppointments[0].service.uuid).toEqual("2049ddaa-1287-450e-b4a3-8f523b072827");
        expect(filteredAppointments[1].service.uuid).toEqual("e9bbf8dc-6807-4b98-a28c-3671eeac6945");
    });

    it('should return all appointments when serviceUuids and serviceTypeUuids are empty', function () {
        var appointmentsForFilter = [{
            "uuid": "8f895c2d-130d-4e12-a621-7cb6c16a2095",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203006",
                "name": "patient name",
                "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
            },
            "service": {
                "appointmentServiceId": 5,
                "name": "Consultation",
                "speciality": {},
                "uuid": "2049ddaa-1287-450e-b4a3-8f523b072827",
                "color": "#006400",
                "creatorName": null
            },
            "serviceType": {"duration": 20, "name": "typeB", "uuid": "a416f7b8-86e1-4407-b7b7-006135e37898"},
            "provider": {"name": "Super Man", "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75"},
            "location": null,
            "startDateTime": 1503923400000,
            "endDateTime": 1503925200000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }, {
            "uuid": "4eced572-63ab-4cd7-8b19-9d12ee6b3580",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203006",
                "name": "patient name",
                "uuid": "4175c013-a44c-4be6-bd87-6563675d2da1"
            },
            "service": {
                "appointmentServiceId": 6,
                "name": "Cardiomyopathy",
                "speciality": {"name": "Cardiology", "uuid": "5a63ba2f-8be0-11e7-acfb-0800274a5156"},
                "location": {},
                "uuid": "e9bbf8dc-6807-4b98-a28c-3671eeac6945",
                "color": "#006400",
                "creatorName": null
            },
            "serviceType": {"duration": 20, "name": "typeA", "uuid": "a416f7b8-86e1-4407-b7b7-006135e36cf5"},
            "provider": null,
            "location": null,
            "startDateTime": 1503912600000,
            "endDateTime": 1503913800000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }];
        var filters = {serviceUuids: [], serviceTypeUuids: []};
        var filteredAppointments = appointmentsFilter(appointmentsForFilter, filters);
        expect(filteredAppointments.length).toBe(2);
        expect(filteredAppointments[0].service.uuid).toEqual("2049ddaa-1287-450e-b4a3-8f523b072827");
        expect(filteredAppointments[1].service.uuid).toEqual("e9bbf8dc-6807-4b98-a28c-3671eeac6945");
    });
});