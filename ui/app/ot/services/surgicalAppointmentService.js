'use strict';

angular.module('bahmni.ot')
    .service('surgicalAppointmentService', ['$http', function ($http) {
        this.getSurgeons = function (conceptName) {
            return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                params: {
                    name: conceptName,
                    v: "bahmni",
                    locale: "en"
                },
                method: "GET",
                withCredentials: true
            });
        };
    }]);
