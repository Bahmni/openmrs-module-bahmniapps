'use strict';

angular.module('bahmni.clinical')
    .service('patientVisitHistoryService', ['visitService', function (visitService) {
        this.getVisitHistory = function (patientUuid) {
            return visitService.search({patient: patientUuid, v: 'custom:(uuid,visitType:(uuid,name,display),startDatetime,stopDatetime,' +
            'encounters:(uuid,display,encounterDatetime,obs,encounterProviders:(provider)))', includeInactive: true})
                .then(function (data) {
                    var visits = data.data.results.map(function (visitData) {
                        return new Bahmni.Clinical.VisitHistoryEntry(visitData);
                    });
                    var activeVisit = visits.filter(function (visit) {
                        return visit.isActive();
                    })[0];

                    return {"visits": visits, "activeVisit": activeVisit};
                });
        };
    }]);