'use strict';

angular.module('resources.visitService', [])
    .factory('visitService', ['$http', '$rootScope', function ($http, $rootScope) {

    
    var create = function (visit) {
        return $http.post(constants.bahmniRESTBaseURL + '/bahmniencounter', visit, {
            withCredentials: true
        });
    };

    var get =  function (patientUUID, visitTypeUUID, encounterTypeUUID) {
        var url = constants.bahmniRESTBaseURL + "/bahmniencounter";
        return $http.get(url, {
            params: {"patientUUID": patientUUID, "visitTypeUUID" : visitTypeUUID, "encounterTypeUUID" : encounterTypeUUID},
            withCredentials: true
        });
    }

    return {
        create: create,
        get : get
    };
}]);