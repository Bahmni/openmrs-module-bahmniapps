'use strict';

angular.module('opd.consultation.services')
    .factory('visitService', ['$http', function ($http) {

    var getVisit = function (uuid) {
        return $http.get("/openmrs/ws/rest/v1/visit/" + uuid, { method:"GET" });
    }

    return {
        getVisit: getVisit
    };
}]);