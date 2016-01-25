'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineSyncInitialization', ['offlineDbService', 'offlineSyncService', 'offlineService', 'offlineMarkerDbService', 'offlineAddressHierarchyDbService', 'androidDbService',
        function (offlineDbService, offlineSyncService, offlineService, offlineMarkerDbService, offlineAddressHierarchyDbService, androidDbService) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()){
                        offlineDbService = androidDbService;
                    }
                    offlineDbService.init(offlineDb);
                    offlineMarkerDbService.init(offlineDb);
                    offlineAddressHierarchyDbService.init(offlineDb);
                    offlineDbService.populateData(window.location.origin);
                    offlineSyncService.sync();
                }
            };
        }
    ]);