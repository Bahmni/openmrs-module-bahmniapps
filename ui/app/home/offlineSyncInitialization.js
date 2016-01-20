'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineSyncInitialization', ['offlineDbService', 'offlineSyncService', 'offlineService', 'offlineMarkerDbService', 'offlineAddressHierarchyDbService',
        function (offlineDbService, offlineSyncService, offlineService, offlineMarkerDbService, offlineAddressHierarchyDbService) {
            return function (offlineDb) {
                if (offlineService.isChromeApp()) {
                    offlineDbService.init(offlineDb);
                    offlineMarkerDbService.init(offlineDb);
                    offlineAddressHierarchyDbService.init(offlineDb);
                    offlineDbService.populateData();
                    offlineSyncService.sync();
                }
            };
        }
    ]);