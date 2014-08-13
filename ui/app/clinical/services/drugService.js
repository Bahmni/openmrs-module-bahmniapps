'use strict';

angular.module('bahmni.clinical')
    .factory('DrugService', ['$http', function ($http) {

    var search = function (drugName) {
        return $http.get("/openmrs/ws/rest/v1/drug",
         	{ 
         		method:"GET",
         		params: { v: 'custom:(uuid,name,doseStrength,units,dosageForm,concept:(uuid,name))', q: drugName },
                withCredentials: true
         	}
        );
    }

    return {
        search: search
    };
}]);