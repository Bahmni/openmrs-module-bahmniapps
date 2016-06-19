'use strict';

angular.module('bahmni.clinical')
    .service('patientVisitHistoryService', ['visitService', function (visitService) {
        this.getVisitHistory = function (patientUuid) {
            return visitService.search({patient: patientUuid, v: 'custom:(uuid,visitType,startDatetime,stopDatetime,encounters:(uuid))', includeInactive: true})
                .then(function (data) {
                    var visits = _.map(data.data.results, function(visitData) {
                        return new Bahmni.Clinical.VisitHistoryEntry(visitData);
                    });
                    var activeVisit = visits.filter(function (visit) {
                        return visit.isActive();
                    })[0];

                    return {"visits": visits, "activeVisit": activeVisit};
                });
        };
    }]);