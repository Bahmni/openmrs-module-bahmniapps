'use strict';

Bahmni.Appointments.AppointmentServiceViewModel = (function () {
    var Service = function (serviceDetails) {
        angular.extend(this, serviceDetails);
    };

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

    Service.createFromResponse = function (serviceDetails) {
        var getDateTime = function (time) {
            return time ? new Date("January 01, 1970 " + time) : undefined;
        };

        var parseAvailability = function (avbsByDay) {
            var groupedAvbs = _.groupBy(avbsByDay, function (avb) {
                return avb.startTime + '#' + avb.endTime + '#' + avb.maxAppointmentsLimit;
            });

            return Object.keys(groupedAvbs).map(function (key) {
                var result = {};
                result.startTime = getDateTime(groupedAvbs[key][0].startTime);
                result.endTime = getDateTime(groupedAvbs[key][0].endTime);
                result.maxAppointmentsLimit = groupedAvbs[key][0].maxAppointmentsLimit;
                var selectedDays = groupedAvbs[key];
                var days = angular.copy(constDays);
                selectedDays.map(function (day) {
                    var d = _.find(days, {dayOfWeek: day.dayOfWeek});
                    d.uuid = day.uuid;
                    d.isSelected = true;
                });
                result.days = days;
                return result;
            });
        };

        var service = new Service({
            name: serviceDetails.name,
            uuid: serviceDetails.uuid,
            description: serviceDetails.description,
            durationMins: serviceDetails.durationMins,
            maxAppointmentsLimit: serviceDetails.maxAppointmentsLimit,
            color: serviceDetails.color,
            startTime: getDateTime(serviceDetails.startTime),
            endTime: getDateTime(serviceDetails.endTime),
            specialityUuid: serviceDetails.speciality ? serviceDetails.speciality.uuid : undefined,
            locationUuid: serviceDetails.location ? serviceDetails.location.uuid : undefined,
            weeklyAvailability: parseAvailability(serviceDetails.weeklyAvailability) || [],
            serviceTypes: serviceDetails.serviceTypes || []
        });
        return service;
    };

    return Service;
})();

