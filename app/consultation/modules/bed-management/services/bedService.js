'use strict';

angular.module('opd.bedManagement.services')
    .factory('BedService', ['$http', function ($http) {

        var bedDetailsForPatient = function (uuid) {
            return $http.get("/openmrs/ws/rest/v1/beds", {
                method: "GET",
                params: {patientUuid:uuid, v: "full"},
                withCredentials: true
            });
        }

        return {
            bedDetailsForPatient: bedDetailsForPatient
        };
    }]);
