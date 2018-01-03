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
                return $http.get(Bahmni.Common.Constants.appointmentServiceUrl + "/all/default", {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };

            this.getAllServicesWithServiceTypes = function () {
                return $http.get(Bahmni.Common.Constants.appointmentServiceUrl + "/all/full", {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };

            this.getServiceLoad = function (serviceUuid, startDateTime, endDateTime) {
                var params = {uuid: serviceUuid, startDateTime: startDateTime, endDateTime: endDateTime};
                return $http.get(Bahmni.Appointments.Constants.getServiceLoad, {
                    params: params,
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };

            this.getService = function (uuid) {
                return $http.get(Bahmni.Common.Constants.appointmentServiceUrl + "?uuid=" + uuid, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };

            this.deleteAppointmentService = function (serviceUuid) {
                var params = {uuid: serviceUuid};
                return $http.delete(Bahmni.Common.Constants.appointmentServiceUrl, {
                    params: params,
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };
        }]);
