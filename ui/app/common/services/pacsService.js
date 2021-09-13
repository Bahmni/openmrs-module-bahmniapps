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

        var getAccessionNumber = function (identifier) {
            if (identifier.system.indexOf("urn:bahmni:accession") < 0) {
                return null;
            }
            var parts = identifier.value.split("urn:oid:");
            return parts && parts.length === 2 ? parts[1] : "";
        };

        return {
            search: search,
            getAccessionNumber: getAccessionNumber
        };
    }]);
