'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineSyncInitialization', ['offlineDbService', 'offlineSyncService', 'offlineService', 'offlineMarkerDbService', 'offlineAddressHierarchyDao',
        function (offlineDbService, offlineSyncService, offlineService, offlineMarkerDbService, offlineAddressHierarchyDao) {
            return function (offlineDb) {
                if (offlineService.isChromeApp()) {
                    offlineDbService.init(offlineDb);
                    offlineMarkerDbService.init(offlineDb);
                    offlineAddressHierarchyDao.init(offlineDb);
                    offlineDbService.populateData();
                    offlineSyncService.sync();
                }
            };
        }
    ]);