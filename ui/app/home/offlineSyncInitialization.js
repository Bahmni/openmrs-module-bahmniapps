'use strict';

angular.module('bahmni.home')
    .factory('offlineSyncInitialization', ['$q', 'offlinePatientDao', 'offlineSyncService', 'offlineService', 'offlineMarkerDao', 'offlineAddressHierarchyDao',
        function ($q, offlinePatientDao, offlineSyncService, offlineService, offlineMarkerDao, offlineAddressHierarchyDao) {
            return function (offlineDb) {
                var deferrable = $q.defer();
                if (offlineService.isOfflineApp()) {
                    offlinePatientDao.init(offlineDb);
                    offlineMarkerDao.init(offlineDb);
                    offlineAddressHierarchyDao.init(offlineDb);
                    offlinePatientDao.populateData();
                    offlineSyncService.sync();
                }
                deferrable.resolve();
                return deferrable.promise;
            };
        }
    ]);