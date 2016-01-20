'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineRegistrationInitialization', ['$q','offlineService', 'offlineSearchDbService','offlineDbService','offlineMarkerDbService','offlineAddressHierarchyDbService',
        function ($q, offlineService, offlineSearchDbService, offlineDbService, offlineMarkerDbService, offlineAddressHierarchyDbService) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    offlineDbService.init(offlineDb);
                    offlineMarkerDbService.init(offlineDb);
                    offlineAddressHierarchyDbService.init(offlineDb);
                    offlineSearchDbService.init(offlineDb);
                }
            };
        }
    ]);