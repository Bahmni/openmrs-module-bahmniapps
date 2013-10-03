'use strict';

angular.module('opd.bedManagement.services')
    .factory('WardLayoutService', ['$http', function ($http) {

        var bedsForWard = function (uuid) {
            return $http.get("/openmrs/ws/rest/v1/admissionLocation/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
        }

        return {
            bedsForWard: bedsForWard
        };
    }]);