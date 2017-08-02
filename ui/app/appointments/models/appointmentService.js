'use strict';

Bahmni.Appointments.AppointmentService = (function () {
    var timeFormat = 'HH:mm:ss';
    var Service = function (serviceDetails) {
        angular.extend(this, serviceDetails);
    };

    Service.createFromUIObject = function (serviceDetails) {
        var dateUtil = Bahmni.Common.Util.DateUtil;

        var getTime = function (dateTime) {
            return dateTime ? dateUtil.getDateTimeInSpecifiedFormat(dateTime, timeFormat) : undefined;
        };

        var constructAvailabilityPerDay = function (result, availability) {
            var selectedDays = availability.days.filter(function (day) {
                return day.isSelected || day.uuid;
            });

            result = result.concat(selectedDays.map(function (day) {
                return { dayOfWeek: day.dayOfWeek,
                    uuid: day.uuid,
                    startTime: getTime(availability.startTime),
                    endTime: getTime(availability.endTime),
                    maxAppointmentsLimit: availability.maxAppointmentsLimit,
                    voided: !day.isSelected };
            }));
            return result;
        };

        var parse = function (availabilities) {
            return availabilities ? availabilities.reduce(constructAvailabilityPerDay, []) : [];
        };

        var service = new Service({
            name: serviceDetails.name,
            uuid: serviceDetails.uuid,
            description: serviceDetails.description,
            durationMins: serviceDetails.durationMins,
            maxAppointmentsLimit: serviceDetails.maxAppointmentsLimit,
            color: serviceDetails.color,
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

