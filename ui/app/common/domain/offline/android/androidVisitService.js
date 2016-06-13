'use strict';

angular.module('bahmni.common.domain')
    .service('visitService', ['$q', function ($q) {
        this.getVisit = function (uuid, params) {
            return $q.when({data : {results: {}}});
        };

        this.endVisit = function (visitUuid) {
            return $q.when({data : {results: {}}});
        };

        this.createVisit = function (visitDetails) {
            return $q.when({data : {results: {}}});
        };

        this.updateVisit = function (visitUuid, attributes) {
            return $q.when({data : {results: {}}});
        };

        this.getVisitSummary = function (visitUuid) {
            return $q.when({data : {results: {}}});
        };

        this.search = function (parameters) {
            return $q.when({data : {results: {}}});
        };

        this.getVisitType = function () {
            return $q.when({data : {results: {}}});
        }
    }]);
