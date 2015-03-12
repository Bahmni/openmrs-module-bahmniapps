'use strict';

angular.module('bahmni.adt')
    .service('QueryService', ['$http', function ($http) {

        this.getResponseFromQuery = function(params){
            return $http.get("/openmrs/ws/rest/v1/bahmnicore/sql" , {
                method: "GET",
                params: params,
                withCredentials: true
            });
        }
    }]);