'use strict';

angular.module('bahmni.common.logging')
    .service('loggingService', ['$http', 'offlineLoggingService', 'eventQueue', 'offlineDbService', 'offlineService', 'androidDbService', function ($http, offlineLoggingService, eventQueue, offlineDbService, offlineService, androidDbService) {
        var log = function (errorDetails) {
            offlineDbService = offlineService.isAndroidApp() ? androidDbService : offlineDbService;
            var errorLogUuid = Bahmni.Common.Offline.UUID.generateUuid();
            return offlineLoggingService.log(errorLogUuid, errorDetails.errorUrl, null, angular.toJson(errorDetails)).then(function () {
                var event = { type: "Error", uuid: errorLogUuid, dbName: offlineDbService.getCurrentDbName() };
                eventQueue.addToEventQueue(event);
            }).catch(function (error) {
                console.log(error);
            });
        };

        var logSyncError = function (errorUrl, status, stackTrace, payload) {
            offlineDbService = offlineService.isAndroidApp() ? androidDbService : offlineDbService;
            var errorLogUuid = Bahmni.Common.Offline.UUID.generateUuid();
            return offlineLoggingService.log(errorLogUuid, errorUrl, status, stackTrace, payload).then(function () {
                var event = { type: "Error", uuid: errorLogUuid, dbName: offlineDbService.getCurrentDbName() };
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
