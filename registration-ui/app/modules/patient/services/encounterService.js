'use strict';

angular.module('registration.patient.services')
    .factory('encounterService', ['$http', '$rootScope', function ($http, $rootScope) {
    
    var create = function (encounter) {
        var encounterClone = jQuery.extend({}, encounter);
        encounterClone.observations.forEach(function(obs) {
            delete obs['conceptName'];
        });
        return $http.post(constants.emrApiRESTBaseURL + '/encounter', encounterClone, {
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