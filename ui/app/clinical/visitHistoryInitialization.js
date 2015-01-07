'use strict';

angular.module('bahmni.clinical').factory('visitHistoryInitialization',
    ['patientVisitHistoryService',
        function (patientVisitHistoryService) {

            return function (patientUuid) {

                var getPatientVisitHistory = function () {
                    return patientVisitHistoryService.getVisits(patientUuid).then(function (response) {
                        var visits = response.map(function (visitData) {
                            return new Bahmni.Clinical.VisitHistoryEntry(visitData)
                        });
                        var activeVisit = visits.filter(function (visit) {
                            return visit.isActive();
                        })[0];

                        return {"visits": visits, "activeVisit": activeVisit};
                    });
                };

                return getPatientVisitHistory();
            }
        }]
);
