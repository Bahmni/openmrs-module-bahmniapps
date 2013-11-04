'use strict';

angular.module('registration.patient.services')
    .factory('visitService', ['$http', '$rootScope', function ($http, $rootScope) {
    
    var create = function (visit) {
        var visitClone = jQuery.extend({}, visit);
        visitClone.observations.forEach(function(obs) {
            delete obs['conceptName'];
        });
        return $http.post(constants.emrApiRESTBaseURL + '/encounter', visitClone, {
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