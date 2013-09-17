'use strict';

angular.module('opd.consultation.services')
    .factory('visitService', ['$http', function ($http) {

    var getVisit = function (uuid) {
        return $http.get("/openmrs/ws/rest/v1/visit/" + uuid,
         	{ 
         		method:"GET",
         		params: {
         			v: "custom:(uuid,patient,encounters:(uuid,encounterType,orders:(concept)))"
         		}
         	}
        );
    }

    return {
        getVisit: getVisit
    };
}]);