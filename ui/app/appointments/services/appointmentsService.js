'use strict';

angular.module('bahmni.appointments')
    .service('appointmentsService', ['$http',
        function ($http) {
            this.save = function (service) {
                return $http.post(Bahmni.Appointments.Constants.createAppointmentUrl, service, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };
        }]);
