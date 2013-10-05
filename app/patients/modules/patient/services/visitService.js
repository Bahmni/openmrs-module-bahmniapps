'use strict';

angular.module('opd.patient.services')
    .factory('VisitService', ['$http', function ($http) {

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
        getAllActivePatients : getAllActivePatients,
        getAllActivePatientsForAdmission : getAllActivePatientsForAdmission
    };
}]);
