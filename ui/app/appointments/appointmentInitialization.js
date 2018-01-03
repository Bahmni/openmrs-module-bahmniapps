'use strict';

angular.module('bahmni.appointments').factory('appointmentInitialization',
    ['appointmentsService', function (appointmentsService) {
        return function ($stateParams) {
            if ($stateParams.appointment) {
                return {appointment: $stateParams.appointment};
            }
            if ($stateParams.uuid) {
                return appointmentsService.getAppointmentByUuid($stateParams.uuid).then(function (response) {
                    return {appointment: response.data};
                });
            }
            return {};
        };
    }]
);
