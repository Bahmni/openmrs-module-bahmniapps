'use strict';

angular.module('opd.patientsListService', ['infrastructure.configurationService'])
    .factory('PatientsListService', ['$http', 'ConfigurationService', function ($http, configurationService) {

    var getActivePatients = function (queryParameters) {
        return $http.get("/openmrs/ws/rest/v1/bahmnicore/patients/active" , {
            method:"GET"  ,
            params:{location: queryParameters.location}
        })
    }

    return {
        getActivePatients:getActivePatients
    };
}]);