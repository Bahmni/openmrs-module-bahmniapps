'use strict';

angular.module('bahmni.clinical').factory('visitHistoryInitialization',
    ['patientVisitHistoryService', 'sessionService', 'locationService',
        function (patientVisitHistoryService, sessionService, locationService) {
            return function (patientUuid) {
                var loginLocationUuid = sessionService.getLoginLocationUuid();
                return locationService.getVisitLocation(loginLocationUuid).then(function (response) {
                    var visitLocationUuid = response.data ? response.data.uuid : null;
                    return patientVisitHistoryService.getVisitHistory(patientUuid, visitLocationUuid);
                });
            };
        }
    ]
);
