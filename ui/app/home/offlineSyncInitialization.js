'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineSyncInitialization', ['offlinePatientDao', 'offlineSyncService', 'offlineService', 'offlineMarkerDao', 'offlineAddressHierarchyDao',
        function (offlinePatientDao, offlineSyncService, offlineService, offlineMarkerDao, offlineAddressHierarchyDao) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    offlinePatientDao.init(offlineDb);
                    offlineMarkerDao.init(offlineDb);
                    offlineAddressHierarchyDao.init(offlineDb);
                    offlinePatientDao.populateData();
                    offlineSyncService.sync();
                }
            };
        }
    ]);