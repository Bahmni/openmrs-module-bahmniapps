'use strict';

angular.module('bahmni.common.domain')
    .factory('providerService', ['$http', function ($http) {
        var search = function(fieldValue){
            return $http.get("/openmrs/ws/rest/v1/provider", {
                method: "GET",
                params: { q: fieldValue ,v: "full"},
                withCredentials: true
            });
        };

        var searchByUuid = function(uuid) {
            return $http.get("/openmrs/ws/rest/v1/provider", {
                method: "GET",
                params: {
                    user: uuid
                },
                cache: false
            });
        };

        return{
            search : search,
            searchByUuid : searchByUuid
        };
    }]);