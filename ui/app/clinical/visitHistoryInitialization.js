'use strict';

angular.module('bahmni.clinical').factory('visitHistoryInitialization',
    ['patientVisitHistoryService',
        function (patientVisitHistoryService) {
            return function (patientUuid) {
                return patientVisitHistoryService.getVisitHistory(patientUuid);
            }
        }
    ]
);
