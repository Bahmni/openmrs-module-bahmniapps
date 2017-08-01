'use strict';

Bahmni.Appointments.AppointmentServiceViewModel = (function () {
    var Service = function (serviceDetails) {
        angular.extend(this, serviceDetails);
    };

    Service.createFromResponse = function (serviceDetails) {
        var getDateTime = function (time) {
            return time ? new Date('1970-01-01 ' + time) : undefined;
        };

        var service = new Service({
            name: serviceDetails.name,
            description: serviceDetails.description,
            durationMins: serviceDetails.durationMins,
            maxAppointmentsLimit: serviceDetails.maxAppointmentsLimit,
            color: serviceDetails.color,
            startTime: getDateTime(serviceDetails.startTime),
            endTime: getDateTime(serviceDetails.endTime),
            specialityUuid: serviceDetails.specialityUuid,
            locationUuid: serviceDetails.location && serviceDetails.location.uuid,
            weeklyAvailability: serviceDetails.weeklyAvailability || [],
            serviceTypes: serviceDetails.serviceTypes || []
        });
        return service;
    };

    return Service;
})();

