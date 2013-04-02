'use strict';

angular.module('resources.autoCompleteService', [])
    .factory('autoCompleteService', ['$http', '$rootScope', function ($http, $rootScope) {

    var urlMap;

    var init = function(){
        urlMap = {
            "familyName" : "/ws/rest/v1/raxacore/unique/personname",
            "caste" : "/ws/rest/v1/raxacore/unique/personattribute"
        }
    }
    init();

    var getAutoCompleteList = function(key, query){
        var url = $rootScope.BaseUrl + urlMap[key];

        return $http.get(url, {
            method: "GET",
            params: {q: query, key: key },
            withCredentials: true
        });
    }

    return{
        getAutoCompleteList : getAutoCompleteList
    };
}]);
