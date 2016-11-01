'use strict';

angular.module('bahmni.common.bacteriologyresults')
    .factory('bacteriologyResultsService', ['$http', function ($http) {
        var getBacteriologyResults = function (data) {
            var params = {
                patientUuid: data.patientUuid,
                name: "BACTERIOLOGY CONCEPT SET",
                v: "full"
            };
            if (data.patientProgramUuid) {
                params = {
                    patientProgramUuid: data.patientProgramUuid,
                    s: "byPatientProgram",
                    v: "full"
                };
            }
            return $http.get(Bahmni.Common.Constants.bahmniBacteriologyResultsUrl, {
                method: "GET",
                params: params,
                withCredentials: true
            });
        };

        var saveBacteriologyResults = function (specimen) {
            return $http.post(Bahmni.Common.Constants.bahmniBacteriologyResultsUrl, specimen, {
                withCredentials: true
            });
        };

        return {
            getBacteriologyResults: getBacteriologyResults,
            saveBacteriologyResults: saveBacteriologyResults
        };
    }]);
