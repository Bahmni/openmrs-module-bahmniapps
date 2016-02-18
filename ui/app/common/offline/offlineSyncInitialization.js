'use strict';

angular.module('bahmni.common.offline')
        .factory('offlineSyncInitialization', ['offlineDbService', 'offlineSyncService', 'offlineService',
        'offlineMarkerDbService', 'offlineAddressHierarchyDbService', 'androidDbService', 'offlineConfigDbService',
        function (offlineDbService, offlineSyncService, offlineService, offlineMarkerDbService,
                  offlineAddressHierarchyDbService, androidDbService, offlineConfigDbService) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    if (offlineService.isAndroidApp()){
                        offlineDbService = androidDbService;
                    }
                    offlineDbService.init(offlineDb);
                    offlineMarkerDbService.init(offlineDb);
                    offlineAddressHierarchyDbService.init(offlineDb);
                    offlineConfigDbService.init(offlineDb);
                    offlineDbService.populateAttributeTypes(Bahmni.Common.Constants.hostURL); //TODO: Will be removed after #1037 is played
                    offlineSyncService.sync();
                }
            };
        }
    ]);