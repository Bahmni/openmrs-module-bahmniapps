'use strict';

angular.module('bahmni.common.logging')
    .service('loggingService', ['$http', 'offlineLoggingService', 'eventQueue', function ($http, offlineLoggingService, eventQueue) {
        var log = function (errorDetails) {
            var errorLogUuid = Bahmni.Common.Offline.UUID.generateUuid();
            return offlineLoggingService.log(errorLogUuid, errorDetails.errorUrl, null, angular.toJson(errorDetails)).then(function () {
                var event = { type: "Error", uuid: errorLogUuid };
                eventQueue.addToEventQueue(event);
            });
        };

        var logSyncError = function (errorUrl, status, stackTrace, payload) {
            var errorLogUuid = Bahmni.Common.Offline.UUID.generateUuid();
            return offlineLoggingService.log(errorLogUuid, errorUrl, status, stackTrace, payload).then(function () {
                var event = { type: "Error", uuid: errorLogUuid };
                eventQueue.addToEventQueue(event);
            }).catch(function (error) {
                console.log(error);
            });
        };

        return {
            log: log,
            logSyncError: logSyncError
        };
    }]);
