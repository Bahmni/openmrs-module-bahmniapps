'use strict';

angular.module('opd.bedManagement.services')
    .service('WardService', ['$http', function ($http) {

        this.bedsForWard = function (uuid) {
            return $http.get("/openmrs/ws/rest/v1/admissionLocation/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
        };

        this.assignBed = function (bedId, patientUuid) {
            var patientJson = {"patientUuid": patientUuid};
            return $http.post("/openmrs/ws/rest/v1/beds/" + bedId, patientJson, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        this.getWardsList = function () {
            return $http.get("/openmrs/ws/rest/v1/admissionLocation");
        };

    }]);
