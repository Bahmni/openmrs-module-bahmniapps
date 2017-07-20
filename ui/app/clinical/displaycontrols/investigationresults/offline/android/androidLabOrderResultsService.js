'use strict';

angular.module('bahmni.clinical')
    .service('offlineLabOrderResultsService', ['$q', 'androidDbService',
        function ($q, androidDbService) {
            this.getLabOrderResultsForPatient = function (params) {
                return androidDbService.getLabOrderResultsForPatient(params.patientUuid).then(function (results) {
                    results = results === null ? {
                        results: {
                            "results": [],
                            "tabularResult": {"dates": [], "orders": [], "values": []}
                        }
                    } : results;

                    return {"data": results.results};
                });
            };
        }]);
