'use strict';

angular.module('bahmni.appointments')
    .service('specialityService', ['$http',
        function ($http) {
            this.getAllSpecialities = function () {
                return $http.get(Bahmni.Appointments.Constants.getAllSpecialitiesUrl, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };
        }]);

