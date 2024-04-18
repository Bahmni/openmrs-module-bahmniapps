'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('conceptSetService', ['$http', '$q', '$bahmniTranslate', function ($http, $q, $bahmniTranslate) {
        var getConcept = function (params, cache) {
            return $http.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                params: params,
                cache: cache
            });
        };

        var getComputedValue = function (encounterData) {
            var url = Bahmni.Common.Constants.encounterModifierUrl;
            return $http.post(url, encounterData, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

        var getObsTemplatesForProgram = function (programUuid) {
            var url = Bahmni.Common.Constants.entityMappingUrl;
            return $http.get(url, {
                params: {
                    entityUuid: programUuid,
                    mappingType: 'program_obstemplate',
                    s: 'byEntityAndMappingType'
                }
            });
        };

        return {
            getConcept: getConcept,
            getComputedValue: getComputedValue,
            getObsTemplatesForProgram: getObsTemplatesForProgram
        };
    }]);

