'use strict';

describe('AppointmentService', function () {
    var dateUtil = Bahmni.Common.Util.DateUtil;
    var timeFormat = 'HH:mm:ss';

    it('should change date time format to time string', function () {
        var startDateTime = new Date('Thu Jan 01 1970 09:45:00 GMT+0530 (IST)');
        var endDateTime = new Date('Thu Jan 01 1970 18:30:00 GMT+0530 (IST)');
        var service = {
            name: 'Chemotherapy',
            description: 'For cancer',
            startTime: startDateTime,
            endTime: endDateTime,
            maxAppointmentsLimit: 30,
            specialityUuid: 'specUuid',
            locationUuid: 'locUuid'
        };
        var appointmentService = Bahmni.Appointments.AppointmentService.createFromUIObject(service);

        expect(appointmentService.name).toBe(service.name);
        expect(appointmentService.description).toBe(service.description);
        expect(appointmentService.maxAppointmentsLimit).toBe(service.maxAppointmentsLimit);
        expect(appointmentService.startTime).toBe(dateUtil.getDateTimeInSpecifiedFormat(startDateTime, timeFormat));
        expect(appointmentService.endTime).toBe(dateUtil.getDateTimeInSpecifiedFormat(endDateTime, timeFormat));
        expect(appointmentService.locationUuid).toBe(service.locationUuid);
        expect(appointmentService.specialityUuid).toBe(service.specialityUuid);
    });

    it('should re arrange all weeklyAvailabilities by day', function () {
        var startDateTime = new Date().toString();
        var endDateTime = new Date().toString();
        var service = {
            name: 'Chemotherapy',
            description: 'For cancer',
            weeklyAvailability: [{
                startTime: startDateTime,
                endTime: endDateTime,
                days: [{name: 'MONDAY', isSelected: true},
                       {name: 'TUESDAY', isSelected: true},
                       {name: 'SUNDAY', isSelected: false}]
            }]
        };
        var appointmentService = Bahmni.Appointments.AppointmentService.createFromUIObject(service);

        expect(appointmentService.weeklyAvailability.length).toBe(2);
        var startTime = dateUtil.getDateTimeInSpecifiedFormat(startDateTime, timeFormat);
        var endTime = dateUtil.getDateTimeInSpecifiedFormat(endDateTime, timeFormat);
        expect(appointmentService.weeklyAvailability[0]).toEqual({dayOfWeek: 'MONDAY', startTime: startTime, endTime: endTime});
        expect(appointmentService.weeklyAvailability[1]).toEqual({dayOfWeek: 'TUESDAY', startTime: startTime, endTime: endTime});
    });
});
