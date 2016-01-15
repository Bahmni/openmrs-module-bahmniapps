'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineRegistrationInitialization', ['$q','offlineService', 'offlineSearchDao','offlineDao','offlineMarkerDao','offlineAddressHierarchyDao',
        function ($q, offlineService, offlineSearchDao, offlineDao, offlineMarkerDao, offlineAddressHierarchyDao) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    offlineDao.init(offlineDb);
                    offlineMarkerDao.init(offlineDb);
                    offlineAddressHierarchyDao.init(offlineDb);
                    offlineSearchDao.init(offlineDb);
                }
            };
        }
    ]);