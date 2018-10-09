'use strict';

describe('AppointmentService', function () {
    var dateUtil = Bahmni.Common.Util.DateUtil;
    var timeFormat = 'HH:mm:ss';
    var constDays = [{
        dayOfWeek: 'SUNDAY',
        isSelected: false
    }, {
        dayOfWeek: 'MONDAY',
        isSelected: false
    }, {
        dayOfWeek: 'TUESDAY',
        isSelected: false
    }, {
        dayOfWeek: 'WEDNESDAY',
        isSelected: false
    }, {
        dayOfWeek: 'THURSDAY',
        isSelected: false
    }, {
        dayOfWeek: 'FRIDAY',
        isSelected: false
    }, {
        dayOfWeek: 'SATURDAY',
        isSelected: false
    }];

    it('should change date time format to time string', function () {
        var startDateTime = new Date('Thu Jan 01 1970 09:45:00 GMT+0530 (IST)');
        var endDateTime = new Date('Thu Jan 01 1970 18:30:00 GMT+0530 (IST)');
        var service = {
            name: 'Chemotherapy',
            description: 'For cancer',
            startTime: startDateTime,
            color: "#fffff0",
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
        expect(appointmentService.color).toBe("#fffff0");
    });

    it('should re arrange all weeklyAvailabilities by day', function () {
        var startDateTime = new Date().toString();
        var endDateTime = new Date().toString();

        var days = angular.copy(constDays);
        days[1].isSelected = true;
        days[2].isSelected = true;
        var service = {
            name: 'Chemotherapy',
            description: 'For cancer',
            weeklyAvailability: [{
                startTime: startDateTime,
                endTime: endDateTime,
                maxAppointmentsLimit: 4,
                days: days
            }]
        };
        var appointmentService = Bahmni.Appointments.AppointmentService.createFromUIObject(service);

        expect(appointmentService.weeklyAvailability.length).toBe(2);
        var startTime = dateUtil.getDateTimeInSpecifiedFormat(startDateTime, timeFormat);
        var endTime = dateUtil.getDateTimeInSpecifiedFormat(endDateTime, timeFormat);
        expect(appointmentService.weeklyAvailability[0]).toEqual({dayOfWeek: 'MONDAY', uuid: undefined, maxAppointmentsLimit: 4, startTime: startTime, endTime: endTime, voided: false});
        expect(appointmentService.weeklyAvailability[1]).toEqual({dayOfWeek: 'TUESDAY', uuid: undefined, maxAppointmentsLimit: 4, startTime: startTime, endTime: endTime, voided: false});
    });

    it('should construct weekly availability by day for multiple availabilities', function () {
        var startDateTime = new Date().toString();
        var endDateTime = new Date().toString();

        var startDateTime2 = new Date("2015-10-01T18:30:00.000Z").toString();
        var endDateTime2 = new Date("2015-10-01T18:30:00.000Z").toString();

        var days1 = angular.copy(constDays);
        days1[1].isSelected = true;
        days1[2].isSelected = true;

        var days2 = angular.copy(constDays);
        days2[1].isSelected = true;
        days2[2].isSelected = true;
        days2[6].uuid = 'uuid1';

        var service = {
            name: 'Chemotherapy',
            description: 'For cancer',
            weeklyAvailability: [
                {
                    startTime: startDateTime,
                    endTime: endDateTime,
                    maxAppointmentsLimit: 5,
                    days: days1
                },
                {
                    startTime: startDateTime2,
                    endTime: endDateTime2,
                    maxAppointmentsLimit: 2,
                    days: days2
                }
            ]
        };
        var appointmentService = Bahmni.Appointments.AppointmentService.createFromUIObject(service);

        expect(appointmentService.weeklyAvailability.length).toBe(5);
        var startTime = dateUtil.getDateTimeInSpecifiedFormat(startDateTime, timeFormat);
        var endTime = dateUtil.getDateTimeInSpecifiedFormat(endDateTime, timeFormat);
        var startTime2 = dateUtil.getDateTimeInSpecifiedFormat(startDateTime2, timeFormat);
        var endTime2 = dateUtil.getDateTimeInSpecifiedFormat(endDateTime2, timeFormat);
        expect(appointmentService.weeklyAvailability).toEqual(
            [{dayOfWeek: 'MONDAY', uuid: undefined, voided: false, maxAppointmentsLimit: 5, startTime: startTime, endTime: endTime},
         {dayOfWeek: 'TUESDAY', uuid: undefined, voided: false, maxAppointmentsLimit: 5, startTime: startTime, endTime: endTime},
         {dayOfWeek: 'MONDAY', uuid: undefined, voided: false, maxAppointmentsLimit: 2, startTime: startTime2, endTime: endTime2},
         {dayOfWeek: 'TUESDAY', uuid: undefined, voided: false, maxAppointmentsLimit: 2, startTime: startTime2, endTime: endTime2},
         {dayOfWeek: 'SATURDAY', uuid: 'uuid1', voided: true, maxAppointmentsLimit: 2, startTime: startTime2, endTime: endTime2}]);
    });
});
