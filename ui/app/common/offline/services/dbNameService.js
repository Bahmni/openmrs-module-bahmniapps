'use strict';

angular.module('bahmni.common.offline')
    .service('dbNameService', ["offlineService", "offlineDbService", "androidDbService", "$q", function (offlineService, offlineDbService, androidDbService, $q) {
        var loadDbNameService = function () {
            var isOfflineApp = offlineService.isOfflineApp();
            if (isOfflineApp) {
                var defer = $q.defer();
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
                offlineDbService.getConfig("offline").then(function (config) {
                    var script = config.value['dbNameCondition.js'];
                    eval(script); // eslint-disable-line no-eval
                    defer.resolve();
                });
            }
            return defer.promise;
        };

        var getDbName = function (provider, loginLocation) {
            return loadDbNameService().then(function () {
                return Bahmni.Common.Offline.dbNameCondition.get(provider, loginLocation);
            });
        };

        return {
            getDbName: getDbName
        };
    }]);
