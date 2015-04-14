'use strict';

angular.module('bahmni.registration')
    .factory('visitService', ['$http', function ($http) {
       var search = function(parameters) {
                return $http.get(Bahmni.Registration.Constants.webServiceRestBaseURL + '/visit', {
                    params: parameters,
                    withCredentials: true
                });
            };

        var endVisit = function (visitUuid) {
                return $http.post(Bahmni.Common.Constants.endVisitUrl + '?visitUuid=' + visitUuid, {
                    withCredentials: true
                });
            };

    return {
        search: search,
        endVisit: endVisit
    };
}]);

