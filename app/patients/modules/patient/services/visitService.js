'use strict';

angular.module('opd.patient.services')
    .factory('VisitService', ['$http', function ($http) {

    var getActiveVisits = function (queryParameters) {
        return $http.get("/openmrs/ws/rest/v1/visit?v=custom:(uuid,patient:(uuid,names,identifiers),encounters:(orders))&includeInactive=false" , {
            method:"GET",
            params:{location: queryParameters.location}
        })
    }

    return {
        getActiveVisits: getActiveVisits
    };
}]);