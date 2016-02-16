'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineRegistrationInitialization', ['$q', 'offlineService', 'offlineSearchDbService',
        function ($q, offlineService, offlineSearchDbService) {
            return function (offlineDb) {
                if (offlineService.isOfflineApp()) {
                    offlineSearchDbService.init(offlineDb);
                }
            };
        }
    ]);
