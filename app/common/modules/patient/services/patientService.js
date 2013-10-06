'use strict';

angular.module('bahmni.common.patient.services')
    .factory('patientService', ['$http', '$rootScope', function ($http, $rootScope) {
        
        var getPatient = function (uuid) {
            var patient = $http.get(Bahmni.Common.Constants.openmrsUrl + "/ws/rest/v1/patient/" + uuid, {
                method: "GET",
                params: {v: "full"},
                withCredentials: true
            });
            return patient;
        };

        var getAllActivePatients = function () {
            return $http.get("/openmrs/ws/rest/v1/bahmnicore/patient/active" , {
                method:"GET"
            })
        };

        var getAllActivePatientsForAdmission = function () {
            return $http.get("/openmrs/ws/rest/v1/bahmnicore/patient/toadmit" , {
                method:"GET"
            })
        };

        return {
            getPatient: getPatient,
            getAllActivePatients : getAllActivePatients,
            getAllActivePatientsForAdmission : getAllActivePatientsForAdmission
        };
        
    }]);
