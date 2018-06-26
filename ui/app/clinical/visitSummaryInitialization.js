'use strict';

angular.module('bahmni.clinical').factory('visitSummaryInitialization',
    ['visitService',
        function (visitService) {
            return function (visitUuid) {
                return visitUuid ? visitService.getVisitSummary(visitUuid).then(function (visitSummaryResponse) {
                    return new Bahmni.Common.VisitSummary(visitSummaryResponse.data);
                }) : null;
            };
        }]
);
