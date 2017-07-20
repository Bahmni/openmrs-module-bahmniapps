'use strict';

angular.module('bahmni.common.logging')
    .service('offlineLoggingService', ['$http', 'offlineDbService', function ($http, offlineDbService) {
        var log = function (errorUuid, failedRequest, responseStatus, stackTrace, requestPayload) {
            return offlineDbService.insertLog(errorUuid, failedRequest, responseStatus, stackTrace, requestPayload);
        };

        return {
            log: log
        };
    }]);
