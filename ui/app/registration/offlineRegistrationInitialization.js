'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineRegistrationInitialization', ['$q','offlineService', 'offlineSearch','offlinePatientDao','offlineMarkerDao','offlineAddressHierarchyDao',
        function ($q, offlineService, offlineSearch, offlinePatientDao, offlineMarkerDao, offlineAddressHierarchyDao) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    offlinePatientDao.init(offlineDb);
                    offlineMarkerDao.init(offlineDb);
                    offlineAddressHierarchyDao.init(offlineDb);
                    offlineSearch.init(offlineDb);
                }
            };
        }
    ]);