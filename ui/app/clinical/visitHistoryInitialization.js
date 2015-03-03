'use strict';

angular.module('bahmni.clinical').factory('visitHistoryInitialization',
    ['patientVisitHistoryService',
        function (patientVisitHistoryService) {
            return function (patientUuid) {
                var x = patientVisitHistoryService.getVisitHistory(patientUuid);
                console.log(JSON.stringify(x));
                return x;
            }
        }
    ]
);
