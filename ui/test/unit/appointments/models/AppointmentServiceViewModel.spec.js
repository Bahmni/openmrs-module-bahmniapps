'use strict';

describe('AppointmentServiceViewModel', function () {
    var appointmentServiceModel;
    var dateUtil = Bahmni.Common.Util.DateUtil;
    var timeFormat = 'HH:mm:ss';
    var startDateTime = new Date('1970-01-01T11:30:00.000Z');
    var endDateTime = new Date('1970-01-01T14:30:00.000Z');

    var serviceResponse = {
        name: 'Ortho',
        description: 'Ortho related services',
        speciality: {
            name: 'Ortho Department',
            uuid: '96a2b38c-18d8-4603-94cd-e2f806251870'
        },
        startTime: dateUtil.getDateTimeInSpecifiedFormat(startDateTime, timeFormat),
        endTime: dateUtil.getDateTimeInSpecifiedFormat(endDateTime, timeFormat),
        maxAppointmentsLimit: 40,
        durationMins: 20,
        location: {
            name: 'Radiology Department',
            uuid: 'locationUuid'
        },
        uuid: 'ae04da57-2d55-4176-a13b-1e6ac97a55e3',
        color: '#00ff00 ',
        weeklyAvailability: [
            {
                dayOfWeek: 'MONDAY',
                startTime: '10:30:00',
                endTime: '16:05:00',
                maxAppointmentsLimit: 4,
                uuid: '66c554e6-e6f1-4f16-b03c-be78d08ce263'
            },
            {
                dayOfWeek: 'SATURDAY',
                startTime: '10:30:00',
                endTime: '16:05:00',
                maxAppointmentsLimit: 4,
                uuid: '66c5901e-e6f1-4f16-b03c-be78d08ce263'
            },
            {
                dayOfWeek: 'WEDNESDAY',
                startTime: '10:30:00',
                endTime: '16:05:00',
                maxAppointmentsLimit: 8,
                uuid: '66c5901e-e6f1-4f16-b03c-be78d08ce263'
            },
            {
                dayOfWeek: 'FRIDAY',
                startTime: '09:30:00',
                endTime: '16:05:00',
                maxAppointmentsLimit: null,
                uuid: 'f4230457-aaa8-479a-88aa-cf3ccccbe1ec'
            }
        ],
        serviceTypes: []
    };
    beforeEach(function () {
        appointmentServiceModel = Bahmni.Appointments.AppointmentServiceViewModel.createFromResponse(serviceResponse);
    });

    it('should change time string to date time', function () {
        expect(appointmentServiceModel.name).toBe('Ortho');
        expect(appointmentServiceModel.startTime.toString()).toEqual(startDateTime.toString());
        expect(appointmentServiceModel.endTime.toString()).toEqual(endDateTime.toString());
        expect(appointmentServiceModel.description).toBe(serviceResponse.description);
        expect(appointmentServiceModel.locationUuid).toBe('locationUuid');
        expect(appointmentServiceModel.color).toBe('#00ff00 ');
    });

    it('should group weekly availability by starTime and endTime', function () {
        expect(appointmentServiceModel.weeklyAvailability.length).toBe(3);

        var availability1 = appointmentServiceModel.weeklyAvailability[0];
        var availability2 = appointmentServiceModel.weeklyAvailability[1];
        var availability3 = appointmentServiceModel.weeklyAvailability[2];

        expect(availability1.maxAppointmentsLimit).toBe(serviceResponse.weeklyAvailability[0].maxAppointmentsLimit);
        expect(availability1.days[1].isSelected).toBeTruthy();
        expect(availability1.days[1].uuid).toBe(serviceResponse.weeklyAvailability[0].uuid);
        expect(availability1.days[6].isSelected).toBeTruthy();
        expect(availability1.days[6].uuid).toBe(serviceResponse.weeklyAvailability[1].uuid);

        expect(availability2.maxAppointmentsLimit).toBe(serviceResponse.weeklyAvailability[2].maxAppointmentsLimit);
        expect(availability2.days[3].isSelected).toBeTruthy();
        expect(availability2.days[3].uuid).toBe(serviceResponse.weeklyAvailability[2].uuid);

        expect(availability3.maxAppointmentsLimit).toBe(serviceResponse.weeklyAvailability[3].maxAppointmentsLimit);
        expect(availability3.days[5].isSelected).toBeTruthy();
        expect(availability3.days[5].uuid).toBe(serviceResponse.weeklyAvailability[3].uuid);
    });
});
