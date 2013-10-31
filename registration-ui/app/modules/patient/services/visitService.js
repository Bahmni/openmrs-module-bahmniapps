'use strict';

angular.module('registration.patient.services')
    .factory('visitService', ['$http', '$rootScope', function ($http, $rootScope) {
    
    var create = function (visit) {
        return $http.post(constants.emrApiRESTBaseURL + '/encounter', visit, {
            withCredentials: true
        });
    };

    var get =  function (patientUuid, visitTypeUuid, encounterTypeUuid) {
        var url = constants.emrApiRESTBaseURL + "/encounter";
        return $http.get(url, {
            params: {"patientUuid": patientUuid, "visitTypeUuid" : visitTypeUuid, "encounterTypeUuid" : encounterTypeUuid},
            withCredentials: true
        });
    }

    return {
        create: create,
        get : get
    };
}]);