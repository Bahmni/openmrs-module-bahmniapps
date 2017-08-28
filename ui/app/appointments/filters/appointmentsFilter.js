'use strict';

angular.module('bahmni.appointments')
    .filter('appointments', [function () {
        var filterAppointmentsByService = function (appointments, serviceUuids) {
            if (_.isEmpty(serviceUuids)) {
                return appointments;
            }
            return _.filter(appointments, function (appointment) {
                return appointment.service && _.includes(serviceUuids, appointment.service.uuid);
            });
        };

        return function (appointments, filters) {
            if (_.isEmpty(filters)) {
                return appointments;
            }
            return filterAppointmentsByService(appointments, filters.serviceUuids);
        };
    }]);
