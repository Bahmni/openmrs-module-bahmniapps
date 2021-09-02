'use strict';
angular.module('bahmni.common.services')
    .factory('pacsService', ['$http', function ($http) {
        var search = function (patientId) {
            var params = {
                patientId: patientId
            };
            return $http.get('/openmrs/ws/rest/v1/pacs/studies', {
                method: "GET",
                params: params,
                withCredentials: true
            });
        };
        return {
            search: search
        };
    }]);
