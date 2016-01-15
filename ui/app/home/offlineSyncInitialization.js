'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineSyncInitialization', ['offlineDao', 'offlineSyncService', 'offlineService', 'offlineMarkerDao', 'offlineAddressHierarchyDao',
        function (offlineDao, offlineSyncService, offlineService, offlineMarkerDao, offlineAddressHierarchyDao) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    offlineDao.init(offlineDb);
                    offlineMarkerDao.init(offlineDb);
                    offlineAddressHierarchyDao.init(offlineDb);
                    offlineDao.populateData();
                    offlineSyncService.sync();
                }
            };
        }
    ]);