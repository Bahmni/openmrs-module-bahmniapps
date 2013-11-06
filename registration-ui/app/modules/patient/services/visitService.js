'use strict';

angular.module('registration.patient.services')
    .factory('visitService', ['$http', function ($http) {
    
    var create = function (visit) {
        return $http.post(constants.webServiceRestBaseURL + '/visit', visit, {
            withCredentials: true
        });
    };

    return {
        create: create
    };
}]);