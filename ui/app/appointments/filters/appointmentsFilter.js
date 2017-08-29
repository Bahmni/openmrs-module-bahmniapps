'use strict';

angular.module('bahmni.appointments')
    .filter('appointments', [function () {
        var filterAppointmentsByService = function (appointments, serviceUuids) {
            return _.filter(appointments, function (appointment) {
                return appointment.service && _.includes(serviceUuids, appointment.service.uuid);
            });
        };

        var filterAppointmentsByServiceType = function (appointments, serviceTypeUuids) {
            return _.filter(appointments, function (appointment) {
                return appointment.serviceType && _.includes(serviceTypeUuids, appointment.serviceType.uuid);
            });
        };

        return function (appointments, filters) {
            if (_.isEmpty(filters) || (_.isEmpty(filters.serviceUuids) && _.isEmpty(filters.serviceTypeUuids))) {
                return appointments;
            }
            var appointmentsFilteredByService = filterAppointmentsByService(appointments, filters.serviceUuids);
            var appointmentsFilteredByServiceType = filterAppointmentsByServiceType(appointments, filters.serviceTypeUuids);
            return appointmentsFilteredByService.concat(appointmentsFilteredByServiceType);
        };
    }]);
