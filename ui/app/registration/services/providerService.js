'use strict';

angular.module('bahmni.registration')
    .factory('providerService', ['$http', function ($http) {
        var search = function(fieldValue){
            return $http.get("/openmrs/ws/rest/v1/provider", {
                method: "GET",
                params: { q: fieldValue ,v: "full"},
                withCredentials: true
            });
        };

        return{
            search : search
        };
    }]);