'use strict';

angular.module('bahmni.common.domain')
    .service('visitService', ['$q', 'androidDbService', function ($q, androidDbService) {
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
            return androidDbService.getVisitByUuid(visitUuid).then(function (visit) {
                var visitSummary = visit.visitJson;

                if (visitSummary.visitType) {
                    visitSummary.visitType = visitSummary.visitType.display;
                }

                return {data: visitSummary};
            });
        };

        this.search = function (parameters) {
            return androidDbService.getVisitDetailsByPatientUuid(parameters.patient).then(function (visits) {
                return {data: {results: _.map(visits, function (visitStr) {
                    return JSON.parse(visitStr);
                })}};
            });
        };

        this.getVisitType = function () {
            return $q.when({data: {results: {}}});
        };
    }]);
