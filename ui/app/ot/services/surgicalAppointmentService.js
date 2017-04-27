'use strict';

angular.module('bahmni.ot')
    .service('surgicalAppointmentService', ['$http', function ($http) {
        this.getSurgeonNames = function () {
            return $http.get(Bahmni.OT.Constants.getSurgeonNames, {
                method: "GET",
                withCredentials: true
            });
        };
    }]);
