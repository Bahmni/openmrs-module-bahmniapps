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
    })

});