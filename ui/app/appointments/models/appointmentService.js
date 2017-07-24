'use strict';

Bahmni.Appointments.AppointmentService = (function () {
    var timeFormat = 'HH:mm:ss';
    var Service = function (serviceDetails) {
        angular.extend(this, serviceDetails);
    };

    Service.createFromUIObject = function (serviceDetails) {
        var dateUtil = Bahmni.Common.Util.DateUtil;
        var constDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

        var getTime = function (dateTime) {
            return dateTime ? dateUtil.getDateTimeInSpecifiedFormat(dateTime, timeFormat) : undefined;
        };

        var constructAvailabilityPerDay = function (result, availability) {
            return result.concat(
               constDays.filter(function (value, index) {
                   return (availability.days & Math.pow(2, index)) !== 0;
               }).map(function (day) {
                   return { dayOfWeek: day,
                       startTime: getTime(availability.startTime),
                       endTime: getTime(availability.endTime)};
               })
           );
        };

        var parse = function (availabilities) {
            return availabilities ? availabilities.reduce(constructAvailabilityPerDay, []) : [];
        };

        var service = new Service({
            name: serviceDetails.name,
            description: serviceDetails.description,
            durationMins: serviceDetails.durationMins,
            maxAppointmentsLimit: serviceDetails.maxAppointmentsLimit,
            startTime: getTime(serviceDetails.startTime),
            endTime: getTime(serviceDetails.endTime),
            specialityUuid: serviceDetails.specialityUuid,
            locationUuid: serviceDetails.locationUuid,
            weeklyAvailability: parse(serviceDetails.weeklyAvailability),
            serviceTypes: serviceDetails.serviceTypes || []
        });
        return service;
    };

    return Service;
})();

