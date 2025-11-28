'use strict';

angular.module('bahmni.common.domain')
    .service('appointmentService', ['$http', '$q', function ($http, $q) {
        var cachedAppointmentServices = null;

        this.getAppointmentServices = function () {
            if (cachedAppointmentServices) {
                return $q.when(cachedAppointmentServices);
            }

            // Use Bahmni.Common.Constants directly (it's a global object, not an injectable service)
            var url = (Bahmni.Common.Constants && Bahmni.Common.Constants.appointmentServiceUrl) || '/openmrs/ws/rest/v1/appointmentService';
            return $http.get(url + "/all/default", {
                withCredentials: true
            }).then(function (response) {
                cachedAppointmentServices = response.data;
                return cachedAppointmentServices;
            });
        };
    }]);

