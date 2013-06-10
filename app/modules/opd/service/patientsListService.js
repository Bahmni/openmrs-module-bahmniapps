'use strict';

angular.module('opd.patientsListService', ['infrastructure.configurationService'])
    .factory('PatientsListService', ['$http', 'ConfigurationService', function ($http, configurationService) {

    var getActivePatients = function (location) {
        return $http.get("http://localhost:8080/openmrs/ws/rest/v1/bahmnicore/patients/active/" + location, {
            method:"GET"
        })
    }

    return {
        getActivePatients:getActivePatients
    };
}]);