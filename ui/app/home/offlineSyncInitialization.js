'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineSyncInitialization', ['offlineDbService', 'offlineSyncService', 'offlineService', 'offlineMarkerDao', 'offlineAddressHierarchyDao',
        function (offlineDbService, offlineSyncService, offlineService, offlineMarkerDao, offlineAddressHierarchyDao) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    offlineDbService.init(offlineDb);
                    offlineMarkerDao.init(offlineDb);
                    offlineAddressHierarchyDao.init(offlineDb);
                    offlineDbService.populateData();
                    offlineSyncService.sync();
                }
            };
        }
    ]);