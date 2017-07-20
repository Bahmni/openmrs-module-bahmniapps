'use strict';

angular.module('bahmni.common.offline')
    .factory('offlinePull', ['offlineService', 'offlineConfigInitialization', 'offlineReferenceDataInitialization', 'offlineSyncInitialization',
        function (offlineService, offlineConfigInitialization, offlineReferenceDataInitialization, offlineSyncInitialization) {
            return function (isInitSync) {
                if (offlineService.isOfflineApp()) {
                    return offlineConfigInitialization().then(function (response) {
                        return offlineReferenceDataInitialization(true).then(function (response) {
                            return offlineSyncInitialization(isInitSync);
                        });
                    });
                }
            };
        }
    ]);
