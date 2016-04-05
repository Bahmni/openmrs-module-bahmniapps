'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineSyncInitialization', ['offlineDbService', 'offlineSyncService', 'offlineService',
        'offlineMarkerDbService', 'offlineAddressHierarchyDbService', 'androidDbService', 'offlineConfigDbService', 'referenceDataDbService','offlineSearchDbService',
        function (offlineDbService, offlineSyncService, offlineService, offlineMarkerDbService,
                  offlineAddressHierarchyDbService, androidDbService, offlineConfigDbService, referenceDataDbService, offlineSearchDbService) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()){
                        offlineDbService = androidDbService;
                    }
                    offlineDbService.init(offlineDb);
                    offlineMarkerDbService.init(offlineDb);
                    offlineAddressHierarchyDbService.init(offlineDb);
                    offlineConfigDbService.init(offlineDb);
                    referenceDataDbService.init(offlineDb);
                    offlineSearchDbService.init(offlineDb);
                    offlineSyncService.init();

                }
            };
        }
    ]);