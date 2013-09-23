'use strict';

angular.module('opd.consultation.services')
    .factory('treatmentService', ['$http', function ($http) {

    var search = function (query) {
        return $http.get("/openmrs/ws/rest/v1/drug",
         	{ 
         		method:"GET",
         		params: { v: 'full', q: query },
                withCredentials: true
         	}
        );
    }

    return {
        search: search
    };
}]);