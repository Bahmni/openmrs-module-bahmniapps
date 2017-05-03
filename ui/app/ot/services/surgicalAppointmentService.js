'use strict';

angular.module('bahmni.ot')
    .service('surgicalAppointmentService', ['$http', function ($http) {
        this.getSurgeons = function () {
            return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                params: {
                    name: "FSTG, Name (s) of Surgeon 1",
                    v: "bahmni",
                    locale: "en"
                },
                method: "GET",
                withCredentials: true
            });
        };
    }]);
