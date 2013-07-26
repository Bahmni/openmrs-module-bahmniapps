'use strict';

angular.module('opd.patient.services')
    .factory('PatientsListService', ['$http', 'configurationService', function ($http, configurationService) {

    var getActivePatients = function (queryParameters) {
        return $http.get("/openmrs/ws/rest/v1/bahmnicore/patient/active" , {
            method:"GET"  ,
            params:{location: queryParameters.location}
        })
    }

    return {
        getActivePatients:getActivePatients
    };
}]);