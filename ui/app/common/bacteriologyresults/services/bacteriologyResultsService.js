'use strict';

angular.module('bahmni.common.bacteriologyresults')
    .factory('bacteriologyResultsService', ['$http', function ($http) {

        var getBacteriologyResults = function (data) {
            var params = {
                concept: data.conceptNames,
                includeObs: data.includeObs,
                patientUuid: data.patientUuid,
                scope: data.scope
        };

            return $http.get(Bahmni.Common.Constants.observationsUrl, {
                params: params,
                withCredentials: true
            });
        };

        return {
            getBacteriologyResults: getBacteriologyResults
        };
    }]);
