'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineRegistrationInitialization', ['$q','offlineService', 'offlineSearchDbService','offlineDbService','offlineMarkerDbService','offlineAddressHierarchyDao',
        function ($q, offlineService, offlineSearchDbService, offlineDbService, offlineMarkerDbService, offlineAddressHierarchyDao) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    offlineDbService.init(offlineDb);
                    offlineMarkerDbService.init(offlineDb);
                    offlineAddressHierarchyDao.init(offlineDb);
                    offlineSearchDbService.init(offlineDb);
                }
            };
        }
    ]);