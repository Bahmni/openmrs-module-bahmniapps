'use strict';

angular.module('bahmni.common.domain')
    .service('visitService', ['$q', 'offlineDbService', function ($q, offlineDbService) {
        this.getVisit = function (uuid, params) {
            return $q.when({data: {results: {}}});
        };

        this.endVisit = function (visitUuid) {
            return $q.when({data: {results: {}}});
        };

        this.createVisit = function (visitDetails) {
            return $q.when({data: {results: {}}});
        };

        this.updateVisit = function (visitUuid, attributes) {
            return $q.when({data: {results: {}}});
        };

        this.getVisitSummary = function (visitUuid) {
            return offlineDbService.getVisitByUuid(visitUuid).then(function (visit) {
                var visitSummary = visit.visitJson;
                return {data: visitSummary};
            });
        };

        this.search = function (parameters) {
            var deferred = $q.defer();
            offlineDbService.getVisitDetailsByPatientUuid(parameters.patient).then(function (visits) {
                deferred.resolve({data: {results: visits}});
            });
            return deferred.promise;
        };

        this.getVisitType = function () {
            return $q.when({data: {results: {}}});
        };
    }]);
