'use strict';

Bahmni.Appointments.Service = (function () {
    var timeFormat = 'HH:mm:ss';
    var Service = function (serviceDetails) {
        angular.extend(this, serviceDetails);
    };

    Service.create = function (serviceDetails) {
        var DateUtil = Bahmni.Common.Util.DateUtil;
        var service = new Service({
            name: serviceDetails.name,
            description: serviceDetails.description,
            durationMins: serviceDetails.durationMins,
            maxAppointmentsLimit: serviceDetails.maxAppointmentsLimit,
            startTime: DateUtil.getDateTimeInSpecifiedFormat(serviceDetails.startTime, timeFormat),
            endTime: DateUtil.getDateTimeInSpecifiedFormat(serviceDetails.endTime, timeFormat),
            specialityUuid: serviceDetails.specialityUuid,
            locationUuid: serviceDetails.locationUuid
        });
        return service;
    };

    return Service;
})();

