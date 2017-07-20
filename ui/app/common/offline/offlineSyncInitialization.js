'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineSyncInitialization', ['offlineSyncService', 'offlineService',
            function (offlineSyncService, offlineService) {
                return function (isInitSync) {
                    if (offlineService.isOfflineApp()) {
                        return offlineSyncService.sync(isInitSync);
                    }
                };
            }
        ]);
