'use strict';

angular.module('bahmni.common.offline')
    .factory('offlinePull', ['offlineService', 'offlineConfigInitialization', 'offlineReferenceDataInitialization', 'offlineSyncInitialization',
        function (offlineService, offlineConfigInitialization, offlineReferenceDataInitialization, offlineSyncInitialization) {
            return function () {
                if(offlineService.isOfflineApp()) {
                    return offlineConfigInitialization().then(function(response){
                        if(response != 1) {
                            return;
                        }
                        return offlineReferenceDataInitialization(true).then(function(response){
                            if(response != 1) {
                                return;
                            }
                            return offlineSyncInitialization();
                        });
                    });
                }
            };
        }
    ]);
