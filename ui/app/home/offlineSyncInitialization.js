'use strict';

angular.module('bahmni.home')
    .factory('offlineSyncInitialization', ['$q', 'offlinePatientDao', 'offlineSyncService', 'offlineService', 'offlineMarkerDao',
        function ($q, offlinePatientDao, offlineSyncService, offlineService, offlineMarkerDao) {
            return function (offlineDb) {
                var deferrable = $q.defer();
                if (offlineService.isOfflineApp()) {
                    offlinePatientDao.init(offlineDb);
                    offlineMarkerDao.init(offlineDb);
                    offlinePatientDao.populateData();
                    offlineSyncService.sync();
                }
                deferrable.resolve();
                return deferrable.promise;
            };
        }
    ]);