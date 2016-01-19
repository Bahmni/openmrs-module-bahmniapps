'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineRegistrationInitialization', ['$q','offlineService', 'offlineSearchDao','offlineDbService','offlineMarkerDao','offlineAddressHierarchyDao',
        function ($q, offlineService, offlineSearchDao, offlineDbService, offlineMarkerDao, offlineAddressHierarchyDao) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    offlineDbService.init(offlineDb);
                    offlineMarkerDao.init(offlineDb);
                    offlineAddressHierarchyDao.init(offlineDb);
                    offlineSearchDao.init(offlineDb);
                }
            };
        }
    ]);