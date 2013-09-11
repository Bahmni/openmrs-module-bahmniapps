'use strict';

angular.module('bahmni.common.infrastructure.services')
    .factory('patientService', ['$http', '$rootScope', function ($http, $rootScope) {
        
        var getPatient = function (uuid) {
            var patient = $http.get(Bahmni.Common.Constants.openmrsUrl + "/ws/rest/v1/patient/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
            return patient;
        };
       
        return {
            getPatient: getPatient
        };
    }]);
