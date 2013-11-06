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
            return $http.get("/openmrs/ws/rest/v1/bahmnicore/sql?q=emrapi.sqlSearch.activePatients" , {
                method:"GET",
                withCredentials: true
            })
        };

        var getAllActivePatientsForAdmission = function () {
            return $http.get("/openmrs/ws/rest/v1/bahmnicore/sql?q=emrapi.sqlSearch.patientsToAdmit" , {
                method:"GET",
                withCredentials: true
            })
        };

        var getAdmittedPatients = function () {
            return $http.get("/openmrs/ws/rest/v1/bahmnicore/sql?q=emrapi.sqlSearch.admittedPatients" , {
                method:"GET",
                withCredentials: true
            })
        };

        var getAllPatientsToBeDischarged = function () {
            return $http.get("/openmrs/ws/rest/v1/bahmnicore/sql?q=emrapi.sqlSearch.patientsToDischarge" , {
                method:"GET",
                withCredentials: true
            })
        };

        return {
            getPatient: getPatient,
            getAllActivePatients : getAllActivePatients,
            getAllActivePatientsForAdmission : getAllActivePatientsForAdmission,
            getAdmittedPatients : getAdmittedPatients,
            getAllPatientsToBeDischarged : getAllPatientsToBeDischarged
        };
        
    }]);
