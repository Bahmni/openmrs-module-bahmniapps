
'use strict';

angular.module('opd.conceptSet.services')
    .factory('conceptSetService', ['$http', function ($http) {
        var getConceptSetMembers = function (params, cache) {
            return $http.get(Bahmni.Common.Constants.conceptUrl, 
            	{
            		params: params,
            		cache: cache
            	});
        };
        return {
            getConceptSetMembers: getConceptSetMembers
        };

    }]);

