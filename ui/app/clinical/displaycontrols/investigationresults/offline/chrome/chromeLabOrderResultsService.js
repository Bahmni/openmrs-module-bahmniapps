'use strict';

angular.module('bahmni.clinical')
    .service('offlineLabOrderResultsService', ['$q', 'offlineDbService',
        function ($q, offlineDbService) {
            this.getLabOrderResultsForPatient = function (params) {
                return offlineDbService.getLabOrderResultsForPatient(params).then(function (results) {
                    return {"data": results.results};
                });
            };
        }]);
