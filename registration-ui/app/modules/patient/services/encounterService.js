'use strict';

angular.module('registration.patient.services')
    .factory('encounterService', ['$http', '$rootScope', function ($http, $rootScope) {
    
    var create = function (encounter) {
        return $http.post(constants.emrApiRESTBaseURL + '/encounter', encounter, {
            withCredentials: true
        });
    };

    var getActiveEncounter =  function (patientUuid, visitTypeUuid, encounterTypeUuid) {
        var url = constants.emrApiRESTBaseURL + "/encounter/active";
        return $http.get(url, {
            params: {"patientUuid": patientUuid, "visitTypeUuid" : visitTypeUuid, "encounterTypeUuid" : encounterTypeUuid, "includeAll" : false},
            withCredentials: true
        });
    }

    return {
        create: create,
        getActiveEncounter : getActiveEncounter
    };
}]);