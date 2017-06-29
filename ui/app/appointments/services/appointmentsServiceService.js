'use strict';
angular.module('bahmni.appointments')
    .service('appointmentsServiceService', ['$http',
        function ($http) {
            this.save = function (service) {
                return $http.post("/url", service, {
                    withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
                });
            };
        }]);
