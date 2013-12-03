'use strict';

angular.module('registration.patient.services')
    .factory('patientAttributeService', ['$http', function ($http) {

    var urlMap;

    var init = function(){
        urlMap = {
            "personName" : "/ws/rest/v1/bahmnicore/unique/personname",
            "personAttribute" : "/ws/rest/v1/bahmnicore/unique/personattribute"
        }
    };
    init();

    var search = function(fieldName, query, type){
        var url = constants.openmrsUrl + urlMap[type];
        var queryWithoutTrailingSpaces = query.trimLeft();

        return $http.get(url, {
            method: "GET",
            params: {q: queryWithoutTrailingSpaces, key: fieldName },
            withCredentials: true
        });
    };

    return{
        search : search
    };
}]);
