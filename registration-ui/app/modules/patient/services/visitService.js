'use strict';

angular.module('registration.patient.services')
    .factory('visitService', ['$http', '$rootScope', function ($http, $rootScope) {
    
    var create = function (visit) {
        return $http.post(constants.bahmniRESTBaseURL + '/bahmniencounter', visit, {
            withCredentials: true
        });
    };

    var get =  function (patientUUID, visitTypeUUID, encounterTypeUUID) {
        var url = constants.emrApiRESTBaseURL + "/encounter";
        return $http.get(url, {
            params: {"patientUuid": patientUUID, "visitTypeUuid" : visitTypeUUID, "encounterTypeUuid" : encounterTypeUUID},
            withCredentials: true
        });
    }

    return {
        create: create,
        get : get
    };
}]);