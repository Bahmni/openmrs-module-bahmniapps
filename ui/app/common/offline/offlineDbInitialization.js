'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineDbInitialization', ['spinner', 'offlineService', 'initializeOfflineSchema', 'offlineDbService', 'androidDbService',
        function (spinner, offlineService, initializeOfflineSchema, offlineDbService, androidDbService) {
            return function () {
                if (offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    return offlineDbService.initSchema().then(function (db) {
                        return db;
                    });
                }
            };
        }
    ]);