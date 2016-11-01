'use strict';

angular.module('bahmni.common.conceptSet')
    .factory('conceptSetService', ['$http', '$q', '$bahmniTranslate', 'offlineDbService', 'androidDbService', 'offlineService', function ($http, $q, $bahmniTranslate, offlineDbService, androidDbService, offlineService) {
        if (offlineService.isAndroidApp()) {
            offlineDbService = androidDbService;
        }
        var getConcept = function (params) {
            params['locale'] = params['locale'] || $bahmniTranslate.use();
            return offlineDbService.getConceptByName(params.name);
        };

        return {
            getConcept: getConcept
        };
    }]);
