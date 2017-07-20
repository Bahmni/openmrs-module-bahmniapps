'use strict';

angular.module('bahmni.common.logging')
    .service('offlineLoggingService', ['$http', 'androidDbService', function ($http, androidDbService) {
        var log = function (errorUuid, failedRequest, responseStatus, stackTrace, requestPayload) {
            return androidDbService.insertLog(errorUuid, failedRequest, responseStatus, stackTrace, requestPayload);
        };

        return {
            log: log
        };
    }]);
