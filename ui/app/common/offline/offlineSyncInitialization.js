'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineSyncInitialization', ['offlineSyncService', 'offlineService',
            function (offlineSyncService, offlineService) {
                return function () {
                    if (offlineService.isOfflineApp()) {
                        return offlineSyncService.sync();
                    }
                };
            }
        ]);
