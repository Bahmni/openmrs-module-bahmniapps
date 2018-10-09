'use strict';

angular.module('bahmni.appointments').factory('appointmentsInitialization',
    [ 'appointmentsService', function (appointmentsService) {
        return function () {
            var getAllAppointmentsForToday = function () {
                var params = {
                    forDate: moment().startOf('day').toDate()
                };
                return appointmentsService.getAllAppointments(params).then(function (response) {
                    return {appointments: response.data};
                });
            };

            return getAllAppointmentsForToday();
        };
    }
    ]
);
