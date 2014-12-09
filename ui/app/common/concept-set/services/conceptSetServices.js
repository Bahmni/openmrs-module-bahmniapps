
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

        var getComputedValue = function(observations){
            var url = Bahmni.Common.Constants.encounterModifierUrl;
            var deferred = $q.defer();
            var data = observations;
            $http.post(url, data, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            }).then(function (response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        };

        return {
            getConceptSetMembers: getConceptSetMembers,
            getComputedValue: getComputedValue
        };

    }]);

