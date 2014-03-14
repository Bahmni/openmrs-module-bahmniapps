'use strict';

angular.module('bahmni.registration')
    .factory('visitService', ['$http', function ($http) {
    
    var create = function (visit) {
        return $http.post(constants.emrApiEncounterUrl , visit, {
            withCredentials: true
        });
    };

    var search = function(parameters) {
        return $http.get(constants.webServiceRestBaseURL + '/visit', {
            params: parameters,
            withCredentials: true
        });
    };

    return {
        create: create,
        search: search
    };
}]);