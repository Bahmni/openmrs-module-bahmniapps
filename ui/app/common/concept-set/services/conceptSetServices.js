
'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('conceptSetService', ['$http', '$q', function ($http, $q) {
        var getConceptSetMembers = function (params, cache) {
            return $http.get(Bahmni.Common.Constants.conceptUrl, 
            	{
            		params: params,
            		cache: cache
            	});
        };

        var getComputedValue = function(encounterData){
            var url = Bahmni.Common.Constants.encounterModifierUrl;
            return $http.post(url, encounterData, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        return {
            getConceptSetMembers: getConceptSetMembers,
            getComputedValue: getComputedValue
        };

    }]);

