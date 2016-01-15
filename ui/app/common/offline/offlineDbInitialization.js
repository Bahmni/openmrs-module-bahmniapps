'use strict';

angular.module('bahmni.common.offline')
    .factory('offlineDbInitialization', ['spinner', 'offlineService', 'initializeOfflineSchema',
        function (spinner, offlineService, initializeOfflineSchema) {
            return function () {
                return spinner.forPromise(initializeOfflineSchema.initSchema().then(function (db) {
                    return db;
                }));
            };
        }
    ]);