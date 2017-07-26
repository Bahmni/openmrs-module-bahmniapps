'use strict';

angular.module('bahmni.appointments')
    .service('appointmentsService', ['$http',
        function ($http) {
            this.save = function (appointment) {
                return $http.post(Bahmni.Appointments.Constants.createAppointmentUrl, appointment, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };
            this.search = function (appointment) {
                return $http.post(Bahmni.Appointments.Constants.searchAppointmentUrl, appointment, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };
        }]);
