'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineRegistrationInitialization', ['$q','offlineService', 'offlineSearchDao','offlineDbService','offlineMarkerDbService','offlineAddressHierarchyDao',
        function ($q, offlineService, offlineSearchDao, offlineDbService, offlineMarkerDbService, offlineAddressHierarchyDao) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    offlineDbService.init(offlineDb);
                    offlineMarkerDbService.init(offlineDb);
                    offlineAddressHierarchyDao.init(offlineDb);
                    offlineSearchDao.init(offlineDb);
                }
            };
        }
    ]);