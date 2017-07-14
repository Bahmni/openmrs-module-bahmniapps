'use strict';

Bahmni.Appointments.AppointmentService = (function () {
    var timeFormat = 'HH:mm:ss';
    var Service = function (serviceDetails) {
        angular.extend(this, serviceDetails);
    };

    Service.createFromUIObject = function (serviceDetails) {
        var dateUtil = Bahmni.Common.Util.DateUtil;
        var getTime = function (dateTime) {
            return dateUtil.getDateTimeInSpecifiedFormat(dateTime, timeFormat);
        };
        var constructAvailabilityPerDay = function (result, availability) {
            return result.concat(availability.days.filter(function (day) {
                return day.isSelected;
            }).map(function (day) {
                return {dayOfWeek: day.name, startTime: getTime(availability.startTime), endTime: getTime(availability.endTime)};
            }));
        };
        var parse = function (availabilities) {
            return availabilities ? availabilities.reduce(constructAvailabilityPerDay, []) : [];
        };
        var service = new Service({
            name: serviceDetails.name,
            description: serviceDetails.description,
            durationMins: serviceDetails.durationMins,
            maxAppointmentsLimit: serviceDetails.maxAppointmentsLimit,
            startTime: serviceDetails.startTime ? getTime(serviceDetails.startTime) : undefined,
            endTime: serviceDetails.endTime ? getTime(serviceDetails.endTime) : undefined,
            specialityUuid: serviceDetails.specialityUuid,
            locationUuid: serviceDetails.locationUuid,
            weeklyAvailability: parse(serviceDetails.weeklyAvailability)
        });
        return service;
    };

    return Service;
})();

