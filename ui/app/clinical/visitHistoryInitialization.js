'use strict';

angular.module('bahmni.clinical').factory('visitHistoryInitialization',
    ['patientVisitHistoryService',
        function (patientVisitHistoryService) {
            return function (patientUuid) {
                var x = patientVisitHistoryService.getVisitHistory(patientUuid);
                return x;
            }
        }
    ]
);
