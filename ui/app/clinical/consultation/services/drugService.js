'use strict';

angular.module('bahmni.clinical')
    .factory('DrugService', ['$http', function ($http) {

        var search = function (drugName) {
            return $http.get("/openmrs/ws/rest/v1/drug",
                {
                    method: "GET",
                    params: { v: 'custom:(uuid,name,doseStrength,units,dosageForm,concept:(uuid,name,names:(name)))', q: drugName, s: "ordered" },
                    withCredentials: true
                }
            ).then(function (response) {
                    return response.data.results;
                });
        };

        return {
            search: search
        };
    }]);