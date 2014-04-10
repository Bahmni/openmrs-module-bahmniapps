'use strict';

angular.module('bahmni.clinical')
    .factory('DrugService', ['$http', function ($http) {

    var search = function (query) {
        return $http.get("/openmrs/ws/rest/v1/drug",
         	{ 
         		method:"GET",
         		params: { v: 'custom:(uuid,name,doseStrength,units,dosageForm,concept:(uuid,name))', q: query },
                withCredentials: true
         	}
        );
    }

    return {
        search: search
    };
}]);