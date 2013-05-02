'use strict';

angular.module('resources.patientAttributeService', [])
    .factory('patientAttributeService', ['$http', function ($http) {

    var urlMap;

    var init = function(){
        urlMap = {
            "familyName" : "/ws/rest/v1/bahmnicore/unique/personname",
            "caste" : "/ws/rest/v1/bahmnicore/unique/personattribute",
            "tehsil" : "/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntries.form"
        }
    }
    init();

    var search = function(fieldName, query){
        var url = constants.openmrsUrl + urlMap[fieldName];
        var queryWithoutTrailingSpaces = query.trimLeft();

        return $http.get(url, {
            method: "GET",
            params: {q: queryWithoutTrailingSpaces, key: fieldName },
            withCredentials: true
        });
    }
    var getAddressAutoCompleteList = function(key, query, addressField){
        var url = constants.openmrsUrl + urlMap[key];
        var queryWithoutTrailingSpaces = query.trimLeft();

        return $http.get(url, {
            method: "GET",
            params: {searchString: queryWithoutTrailingSpaces, addressField: addressField },
            withCredentials: true
        });
    }

    return{
        search : search,
        getAddressAutoCompleteList : getAddressAutoCompleteList
    };
}]);
