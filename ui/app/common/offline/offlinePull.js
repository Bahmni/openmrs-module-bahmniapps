'use strict';

angular.module('bahmni.common.offline')
    .factory('offlinePull', ['offlineService', 'offlineConfigInitialization', 'offlineReferenceDataInitialization', 'offlineSyncInitialization',
        function (offlineService, offlineConfigInitialization, offlineReferenceDataInitialization, offlineSyncInitialization) {
            return function () {
                if(offlineService.isOfflineApp()) {
                    return offlineConfigInitialization().then(function(){
                            return offlineReferenceDataInitialization(true).then(function(){
                                    return offlineSyncInitialization();
                            });
                    });
                }
            };
        }
    ]);
