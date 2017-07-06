'use strict';

angular.module('bahmni.appointments')
    .service('appointmentsServiceService', ['$http',
        function ($http) {
            this.save = function (service) {
                return $http.post(Bahmni.Appointments.Constants.createServiceUrl, service, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };

            this.getAllServices = function () {
                return $http.get(Bahmni.Common.Constants.appointmentServiceUrl + "/all", {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };
        }]);
