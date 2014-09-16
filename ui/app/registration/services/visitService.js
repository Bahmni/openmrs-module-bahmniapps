'use strict';

angular.module('bahmni.registration')
    .factory('visitService', ['$http', function ($http) {
    
    var search = function(parameters) {
        return $http.get(Bahmni.Registration.Constants.webServiceRestBaseURL + '/visit', {
            params: parameters,
            withCredentials: true
        });
    };

    return {
        search: search
    };
}]);