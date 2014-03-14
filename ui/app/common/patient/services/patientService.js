'use strict';

angular.module('bahmni.common.patient')
    .service('patientService', ['$http', function ($http) {
        
        this.getPatient = function (uuid) {
            var patient = $http.get(Bahmni.Common.Constants.openmrsUrl + "/ws/rest/v1/patient/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
            return patient;
        };

        this.findPatients = function (handler) {
            return $http.get("/openmrs/ws/rest/v1/bahmnicore/sql" , {
                method: "GET",
                params: {
                    q:handler,
                    v: "full"
                },
                withCredentials: true
            });
        };

        this.search = function (query, offset) {
            offset = offset || 0;
            return $http.get("/openmrs//ws/rest/v1/patient", {
                method: "GET",
                params: {q: query, s: "byIdOrNameOrVillage", startIndex: offset},
                withCredentials: true
            });
        };

}]);
