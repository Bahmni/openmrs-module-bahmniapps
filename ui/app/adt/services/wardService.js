'use strict';

angular.module('bahmni.adt')
    .service('WardService', ['$http', function ($http) {

        this.bedsForWard = function (uuid) {
            return $http.get("/openmrs/ws/rest/v1/admissionLocation/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
        };

        this.getWardsList = function () {
            return $http.get("/openmrs/ws/rest/v1/admissionLocation");
        };
    }]);
